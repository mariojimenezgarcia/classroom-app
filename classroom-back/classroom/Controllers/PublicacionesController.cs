using classroom.Data;
using classroom.Helpers;
using classroom.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static classroom.DTOs.CrearPublicacionDtos;

namespace classroom.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicacionesController : ControllerBase
    {
        private readonly AppDbContext db;
        private readonly IConfiguration config;

        public PublicacionesController(AppDbContext db, IConfiguration config)
        {
            this.db = db;
            this.config = config;
        }

        // ✅ Normaliza DateTime a UTC para columnas timestamptz (PostgreSQL)
        private static DateTime ToUtc(DateTime dt)
        {
            return dt.Kind switch
            {
                DateTimeKind.Utc => dt,
                DateTimeKind.Local => dt.ToUniversalTime(),
                // Si viene sin zona (Unspecified), lo tratamos como UTC para evitar errores con Npgsql timestamptz
                DateTimeKind.Unspecified => DateTime.SpecifyKind(dt, DateTimeKind.Utc),
                _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
            };
        }

        // Devuelve todas las publicaciones de una clase (solo si el usuario pertenece a la clase o es el creador)
        [HttpGet("{id}/publicaciones")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<IActionResult> GetPublicaciones(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var clase = await db.Clases
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase
                .AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == id && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            var publicacionesDb = await db.Publicaciones
                .AsNoTracking()
                .Where(p => p.ClaseId == id)
                .OrderByDescending(p => p.FechaCreacion)
                .Select(p => new
                {
                    id = p.Id,
                    claseId = p.ClaseId,
                    autorId = p.AutorId,
                    autorNombre = p.Autor != null ? p.Autor.nombre : "",
                    tipo = p.Tipo,
                    titulo = p.Titulo,
                    contenido = p.Contenido,
                    fechaEntrega = p.FechaEntrega,
                    puntuacion = p.Puntuacion,
                    fechaCreacion = p.FechaCreacion,
                })
                .ToListAsync();

            var publicaciones = publicacionesDb.Select(p => new
            {
                p.id,
                p.claseId,
                p.autorId,
                p.autorNombre,
                p.tipo,
                p.titulo,
                p.contenido,
                p.fechaEntrega,
                p.puntuacion,
                p.fechaCreacion,
                adjuntos = helper.AdjuntosHelper.ObtenerAdjuntosPublicacion(p.id)
            }).ToList();

            return Ok(publicaciones);
        }

        // Crea una publicación en una clase (anuncio / tarea / examen) y permite adjuntar archivos
        [HttpPost("{id}/publicaciones")]
        [Authorize(Roles = "alumno,profesor,admin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> CrearPublicacion(int id, [FromForm] CrearPublicacionFormDTO dto)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var clase = await db.Clases
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase
                .AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == id && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            if (User.IsInRole("alumno") && dto.Tipo != TipoPublicacion.Anuncio)
                return StatusCode(403, new { message = "Los alumnos solo pueden crear anuncios." });

            if (string.IsNullOrWhiteSpace(dto.Contenido))
                return BadRequest(new { message = "El contenido es obligatorio." });

            if (dto.Tipo == TipoPublicacion.Anuncio)
            {
                dto.Titulo = null;
                dto.FechaEntrega = null;
                dto.Puntuacion = null;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.Titulo))
                    return BadRequest(new { message = "El título es obligatorio para Tarea/Examen." });

                if (dto.FechaEntrega == null)
                    return BadRequest(new { message = "La fecha de entrega es obligatoria." });

                var fechaEntrega = dto.FechaEntrega.Value;

                // ✅ Normalizar a UTC para Postgres timestamptz
                fechaEntrega = ToUtc(fechaEntrega);
                dto.FechaEntrega = fechaEntrega;

                // ✅ Comparar contra UtcNow
                if (fechaEntrega <= DateTime.UtcNow)
                    return BadRequest(new { message = "La fecha y hora de entrega ya han pasado." });
            }

            var pub = new Publicacion
            {
                ClaseId = id,
                AutorId = usuarioId,
                Tipo = dto.Tipo,
                Titulo = string.IsNullOrWhiteSpace(dto.Titulo) ? null : dto.Titulo.Trim(),
                Contenido = dto.Contenido!.Trim(),
                FechaEntrega = dto.FechaEntrega,   // ya normalizada si aplica
                Puntuacion = dto.Puntuacion,
                // ✅ Guardar en UTC
                FechaCreacion = DateTime.UtcNow
            };

            db.Publicaciones.Add(pub);
            await db.SaveChangesAsync();

            var adjuntosDevueltos = new List<object>();

            if (dto.Archivos != null && dto.Archivos.Count > 0)
            {
                var uploadsRoot = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Uploads",
                    "publicaciones",
                    pub.Id.ToString()
                );

                Directory.CreateDirectory(uploadsRoot);

                foreach (var file in dto.Archivos)
                {
                    if (file == null || file.Length <= 0) continue;

                    var originalName = Path.GetFileName(file.FileName);
                    var ext = Path.GetExtension(originalName);

                    var savedName = $"{Guid.NewGuid():N}{ext}";
                    var fullPath = Path.Combine(uploadsRoot, savedName);

                    using (var stream = System.IO.File.Create(fullPath))
                        await file.CopyToAsync(stream);

                    await helper.AdjuntosHelper.GuardarMetaAdjuntoPublicacionAsync(
                        uploadsRoot,
                        savedName,
                        originalName,
                        file.Length
                    );

                    var relative = $"/Uploads/publicaciones/{pub.Id}/{savedName}";

                    adjuntosDevueltos.Add(new
                    {
                        nombreOriginal = originalName,
                        nombre = savedName,
                        mimeType = file.ContentType,
                        size = file.Length,
                        url = relative
                    });
                }
            }

            var autorNombre = await db.Usuarios
                .AsNoTracking()
                .Where(u => u.Id == usuarioId)
                .Select(u => u.nombre)
                .FirstOrDefaultAsync();

            return Ok(new
            {
                id = pub.Id,
                claseId = pub.ClaseId,
                autorId = pub.AutorId,
                autorNombre = autorNombre ?? "",
                tipo = pub.Tipo,
                titulo = pub.Titulo,
                contenido = pub.Contenido,
                fechaEntrega = pub.FechaEntrega,
                puntuacion = pub.Puntuacion,
                fechaCreacion = pub.FechaCreacion,
                adjuntos = adjuntosDevueltos
            });
        }

        // Elimina una publicación (solo autor o admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<IActionResult> BorrarPublicacion(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var pub = await db.Publicaciones.FirstOrDefaultAsync(p => p.Id == id);
            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            if (pub.AutorId != usuarioId && !User.IsInRole("admin"))
                return StatusCode(403, new { message = "No puedes borrar esta publicación." });

            db.Publicaciones.Remove(pub);
            await db.SaveChangesAsync();

            return Ok(new { message = "Publicación eliminada correctamente." });
        }

        // Devuelve una publicación por id (validando que el usuario tenga acceso a la clase)
        [HttpGet("{id}")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<IActionResult> GetPublicacionById(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var pub = await db.Publicaciones
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    id = p.Id,
                    claseId = p.ClaseId,
                    autorId = p.AutorId,
                    autorNombre = p.Autor != null ? p.Autor.nombre : "",
                    tipo = p.Tipo,
                    titulo = p.Titulo,
                    contenido = p.Contenido,
                    fechaEntrega = p.FechaEntrega,
                    puntuacion = p.Puntuacion,
                    fechaCreacion = p.FechaCreacion,
                    adjuntos = helper.AdjuntosHelper.ObtenerAdjuntosPublicacion(p.Id)
                })
                .FirstOrDefaultAsync();

            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            var clase = await db.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == pub.claseId);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase.AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == pub.claseId && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            return Ok(pub);
        }

        // Devuelve la entrega del usuario logueado para una publicación (si no existe, devuelve null)
        [HttpGet("{id}/mi-entrega")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<IActionResult> GetMiEntrega(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var pub = await db.Publicaciones
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.ClaseId,
                    p.Tipo
                })
                .FirstOrDefaultAsync();

            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            if (pub.Tipo == TipoPublicacion.Anuncio)
                return BadRequest(new { message = "Esta publicación no es una tarea/examen." });

            var clase = await db.Clases
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == pub.ClaseId);

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase
                .AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == pub.ClaseId && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            var entrega = await db.Entregas
                .AsNoTracking()
                .Where(e => e.publicacionId == id && e.idusuario == usuarioId)
                .Select(e => new
                {
                    id = e.id,
                    publicacionId = e.publicacionId,
                    idusuario = e.idusuario,
                    asunto = e.asunto,
                    archivo = e.archivo,
                    archivoNombreOriginal = e.archivoNombreOriginal,
                    archivoMimeType = e.archivoMimeType,
                    archivoSize = e.archivoSize,
                    entregada = e.entregada,
                    fechaEntrega = e.fecha_entrega,
                    nota = e.nota
                })
                .FirstOrDefaultAsync();

            return Ok(entrega);
        }

        // Sube o actualiza la entrega de una tarea/examen y la marca como entregada
        [HttpPost("{id}/entregar")]
        [Authorize(Roles = "alumno,admin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> Entregar(int id, [FromForm] EntregaUpsertDto dto)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var entrega = await db.Entregas
                .FirstOrDefaultAsync(e => e.publicacionId == id && e.idusuario == usuarioId);

            if (entrega == null)
            {
                entrega = new Entrega { publicacionId = id, idusuario = usuarioId };
                db.Entregas.Add(entrega);
            }

            entrega.asunto = dto?.asunto ?? "";

            if (dto?.archivo != null && dto.archivo.Length > 0)
            {
                var uploadsRoot = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Uploads",
                    "entregas",
                    id.ToString(),
                    usuarioId.ToString()
                );

                Directory.CreateDirectory(uploadsRoot);

                var originalName = Path.GetFileName(dto.archivo.FileName);
                var ext = Path.GetExtension(originalName);
                var savedName = $"{Guid.NewGuid():N}{ext}";
                var fullPath = Path.Combine(uploadsRoot, savedName);

                using (var stream = System.IO.File.Create(fullPath))
                    await dto.archivo.CopyToAsync(stream);

                entrega.archivo = $"/Uploads/entregas/{id}/{usuarioId}/{savedName}";
                entrega.archivoNombreOriginal = originalName;
                entrega.archivoMimeType = dto.archivo.ContentType;
                entrega.archivoSize = dto.archivo.Length;
            }

            entrega.entregada = true;
            // ✅ Guardar en UTC
            entrega.fecha_entrega = DateTime.UtcNow;

            await db.SaveChangesAsync();

            return Ok(new { message = "Tarea entregada." });
        }

        // Guarda un borrador de entrega (puede incluir archivo) sin marcarlo como entregado
        [HttpPost("{id}/guardar-borrador")]
        [Authorize(Roles = "alumno,admin")]
        [RequestSizeLimit(50_000_000)]
        public async Task<IActionResult> GuardarBorrador(int id, [FromForm] EntregaUpsertDto dto)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var entrega = await db.Entregas
                .FirstOrDefaultAsync(e => e.publicacionId == id && e.idusuario == usuarioId);

            if (entrega == null)
            {
                entrega = new Entrega { publicacionId = id, idusuario = usuarioId };
                db.Entregas.Add(entrega);
            }

            entrega.asunto = dto?.asunto ?? "";

            if (dto?.archivo != null && dto.archivo.Length > 0)
            {
                var uploadsRoot = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Uploads",
                    "entregas",
                    id.ToString(),
                    usuarioId.ToString()
                );

                Directory.CreateDirectory(uploadsRoot);

                var originalName = Path.GetFileName(dto.archivo.FileName);
                var ext = Path.GetExtension(originalName);
                var savedName = $"{Guid.NewGuid():N}{ext}";
                var fullPath = Path.Combine(uploadsRoot, savedName);

                using (var stream = System.IO.File.Create(fullPath))
                    await dto.archivo.CopyToAsync(stream);

                entrega.archivo = $"/Uploads/entregas/{id}/{usuarioId}/{savedName}";
                entrega.archivoNombreOriginal = originalName;
                entrega.archivoMimeType = dto.archivo.ContentType;
                entrega.archivoSize = dto.archivo.Length;
            }

            entrega.entregada = false;
            entrega.fecha_entrega = null;

            await db.SaveChangesAsync();

            return Ok(new { message = "Borrador guardado." });
        }

        // Anula una entrega ya enviada y la devuelve a borrador
        [HttpPost("{id}/anular-entrega")]
        [Authorize(Roles = "alumno,admin")]
        public async Task<IActionResult> AnularEntrega(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var pub = await db.Publicaciones
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new { p.Id, p.ClaseId, p.Tipo })
                .FirstOrDefaultAsync();

            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            if (pub.Tipo == TipoPublicacion.Anuncio)
                return BadRequest(new { message = "Esta publicación no es una tarea/examen." });

            var clase = await db.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == pub.ClaseId);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase.AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == pub.ClaseId && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            var entrega = await db.Entregas
                .FirstOrDefaultAsync(e => e.publicacionId == id && e.idusuario == usuarioId);

            if (entrega == null)
                return NotFound(new { message = "No existe entrega para anular." });

            entrega.entregada = false;
            entrega.fecha_entrega = null;

            await db.SaveChangesAsync();

            return Ok(new { message = "Entrega anulada. Vuelve a borrador." });
        }

        // Devuelve todas las entregas de una publicación y el resumen de entregadas/pendientes
        [HttpGet("{id}/entregas")]
        [Authorize(Roles = "profesor,admin")]
        public async Task<IActionResult> GetEntregasPublicacion(int id)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var pub = await db.Publicaciones
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new { p.Id, p.ClaseId, p.Tipo })
                .FirstOrDefaultAsync();

            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            if (pub.Tipo == TipoPublicacion.Anuncio)
                return BadRequest(new { message = "Esta publicación no es una tarea/examen." });

            var clase = await db.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == pub.ClaseId);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase.AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == pub.ClaseId && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            var totalAlumnos = await db.UsuarioClase.AsNoTracking()
                .Where(uc => uc.ClaseId == pub.ClaseId)
                .CountAsync();

            var items = await (
                from e in db.Entregas.AsNoTracking()
                join u in db.Usuarios.AsNoTracking() on e.idusuario equals u.Id
                where e.publicacionId == id
                orderby e.fecha_entrega descending
                select new
                {
                    id = e.id,
                    publicacionId = e.publicacionId,
                    idusuario = e.idusuario,
                    alumnoNombre = u.nombre,
                    entregada = e.entregada,
                    fechaEntrega = e.fecha_entrega,
                    nota = e.nota,
                    asunto = e.asunto,
                    archivo = e.archivo,
                    archivoNombreOriginal = e.archivoNombreOriginal,
                    archivoMimeType = e.archivoMimeType,
                    archivoSize = e.archivoSize,
                }
            ).ToListAsync();

            var entregadas = items.Count(x => x.entregada);
            var pendientes = Math.Max(0, totalAlumnos - entregadas);

            return Ok(new { totalAlumnos, entregadas, pendientes, items });
        }

        // Guarda o actualiza la nota de una entrega (solo profesor/admin con acceso a la clase)
        [HttpPut("/api/Entregas/{id}/nota")]
        [Authorize(Roles = "profesor,admin")]
        public async Task<IActionResult> PonerNota(int id, [FromBody] PonerNotaDto dto)
        {
            int usuarioId;
            try
            {
                usuarioId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var entrega = await db.Entregas.FirstOrDefaultAsync(e => e.id == id);
            if (entrega == null)
                return NotFound(new { message = "Entrega no encontrada." });

            var pub = await db.Publicaciones.AsNoTracking()
                .Where(p => p.Id == entrega.publicacionId)
                .Select(p => new { p.Id, p.ClaseId })
                .FirstOrDefaultAsync();

            if (pub == null)
                return NotFound(new { message = "Publicación no encontrada." });

            var clase = await db.Clases.AsNoTracking().FirstOrDefaultAsync(c => c.Id == pub.ClaseId);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var pertenece = await db.UsuarioClase.AsNoTracking()
                .AnyAsync(uc => uc.ClaseId == pub.ClaseId && uc.UsuarioId == usuarioId);

            var esCreador = clase.UsuariosId == usuarioId;

            if (!pertenece && !esCreador)
                return Forbid();

            entrega.nota = dto?.nota;

            await db.SaveChangesAsync();

            return Ok(new { message = "Nota guardada." });
        }
    }
}