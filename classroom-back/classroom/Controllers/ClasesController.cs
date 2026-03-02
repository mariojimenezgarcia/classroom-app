using classroom.Data;
using classroom.DTOs;
using classroom.Models;
using classroom.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace classroom.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClasesController : ControllerBase
    {
        private readonly AppDbContext db;

        public ClasesController(AppDbContext db)
        {
            this.db = db;
        }

        // Devuelve las clases en las que está inscrito el usuario logueado
        [HttpGet("mias")]
        [Authorize(Roles = "alumno,admin,profesor")]
        public async Task<ActionResult<List<ClaseCardDtos>>> MisClases()
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

            var clases = await
                (from uc in db.UsuarioClase.AsNoTracking()
                 join c in db.Clases.AsNoTracking() on uc.ClaseId equals c.Id
                 join u in db.Usuarios.AsNoTracking() on c.UsuariosId equals u.Id into profeJoin
                 from profe in profeJoin.DefaultIfEmpty()
                 where uc.UsuarioId == usuarioId
                 select new ClaseCardDtos
                 {
                     id = c.Id,
                     nombre = c.Nombre,
                     curso = c.Curso,
                     aula = c.Aula,
                     color = c.Color,
                     profesorNombre = profe != null ? profe.nombre : null,
                     imagenUrl = null
                 })
                .ToListAsync();

            return Ok(clases);
        }

        // Crea una nueva clase y asigna automáticamente al profesor creador
        [HttpPost]
        [Authorize(Roles = "profesor,admin")]
        public async Task<IActionResult> CrearClase(ClaseCreateDto dto)
        {
            int profesorId;
            try
            {
                profesorId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            string codigoAcceso = helper.GenerarCodigoAcceso();

            var clase = new Clase
            {
                Nombre = dto.nombre,
                Curso = dto.curso,
                Aula = dto.aula,
                Color = dto.color,
                UsuariosId = profesorId,
                CodigoAcceso = codigoAcceso
            };

            db.Clases.Add(clase);
            await db.SaveChangesAsync();

            var inscripcion = new UsuarioClase
            {
                UsuarioId = profesorId,
                ClaseId = clase.Id
            };

            db.UsuarioClase.Add(inscripcion);
            await db.SaveChangesAsync();

            return Ok(new
            {
                message = "Clase creada correctamente",
                claseId = clase.Id,
                codigoAcceso = codigoAcceso
            });
        }

        // Permite a un alumno unirse a una clase usando el código de acceso
        [HttpPost("unirse")]
        [Authorize(Roles = "alumno,admin")]
        public async Task<IActionResult> UnirseClase(UnirseClaseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.codigoAcceso))
                return BadRequest(new { message = "Código de acceso requerido." });

            int alumnoId;
            try
            {
                alumnoId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var clase = await db.Clases
                .FirstOrDefaultAsync(c => c.CodigoAcceso == dto.codigoAcceso);

            if (clase == null)
                return NotFound(new { message = "Código inválido. La clase no existe." });

            bool yaInscrito = await db.UsuarioClase
                .AnyAsync(uc => uc.UsuarioId == alumnoId && uc.ClaseId == clase.Id);

            if (yaInscrito)
                return BadRequest(new { message = "Ya estás inscrito en esta clase." });

            var inscripcion = new UsuarioClase
            {
                UsuarioId = alumnoId,
                ClaseId = clase.Id
            };

            db.UsuarioClase.Add(inscripcion);
            await db.SaveChangesAsync();

            return Ok(new
            {
                message = "Te has unido correctamente a la clase.",
                claseId = clase.Id,
                nombreClase = clase.Nombre
            });
        }

        // Devuelve el código de acceso de una clase concreta
        [HttpGet("{id}/codigo")]
        [Authorize(Roles = "admin,profesor")]
        public async Task<IActionResult> ObtenerCodigoClase(int id)
        {
            var clase = await db.Clases
                .AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new { claseId = c.Id, nombre = c.Nombre, codigoAcceso = c.CodigoAcceso })
                .FirstOrDefaultAsync();

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            return Ok(clase);
        }

        // Devuelve la lista de personas inscritas en una clase (profesor y alumnos)
        [HttpGet("{id}/personas")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<ActionResult<ClasePersonasDto>> PersonasDeClase(int id)
        {
            var clase = await db.Clases.AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new { c.Id, c.Nombre, c.Curso, c.Aula, c.UsuariosId })
                .FirstOrDefaultAsync();

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var inscritos = await (
                from uc in db.UsuarioClase.AsNoTracking()
                join u in db.Usuarios.AsNoTracking() on uc.UsuarioId equals u.Id
                where uc.ClaseId == id
                select new ClasePersonaRowDto
                {
                    usuarioId = u.Id,
                    nombre = u.nombre,
                    email = u.email,
                    rol = (u.Id == clase.UsuariosId) ? "profesor" : "alumno"
                }
            ).ToListAsync();

            var personasOrdenadas = inscritos
                .OrderByDescending(p => p.rol == "profesor")
                .ThenBy(p => p.nombre)
                .ToList();

            var dto = new ClasePersonasDto
            {
                claseId = clase.Id,
                nombreClase = clase.Nombre,
                curso = clase.Curso,
                aula = clase.Aula,
                personas = personasOrdenadas
            };

            return Ok(dto);
        }

        // Permite editar los datos de una clase (solo el profesor creador)
        [HttpPut("{id}")]
        [Authorize(Roles = "profesor,admin")]
        public async Task<IActionResult> EditarClase(int id, ClaseUpdateDto dto)
        {
            int profesorId;
            try
            {
                profesorId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var clase = await db.Clases.FirstOrDefaultAsync(c => c.Id == id);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            if (clase.UsuariosId != profesorId)
                return Forbid();

            clase.Nombre = dto.nombre;
            clase.Curso = dto.curso;
            clase.Aula = dto.aula;
            clase.Color = dto.color;

            await db.SaveChangesAsync();

            return Ok(new
            {
                message = "Clase actualizada correctamente",
                claseId = clase.Id
            });
        }

        // El creador puede eliminar la clase; el resto solo puede salirse
        [HttpDelete("{id}")]
        [Authorize(Roles = "alumno,profesor,admin")]
        public async Task<IActionResult> EliminarOSalirDeClase(int id)
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

            var clase = await db.Clases.FirstOrDefaultAsync(c => c.Id == id);
            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            var esCreador = clase.UsuariosId == usuarioId;

            if (esCreador)
            {
                var publicacionesIds = await db.Publicaciones
                    .Where(p => p.ClaseId == id)
                    .Select(p => p.Id)
                    .ToListAsync();

                if (publicacionesIds.Count > 0)
                {
                    var entregas = await db.Entregas
                        .Where(e => publicacionesIds.Contains(e.publicacionId))
                        .ToListAsync();

                    db.Entregas.RemoveRange(entregas);
                }

                var publicaciones = await db.Publicaciones
                    .Where(p => p.ClaseId == id)
                    .ToListAsync();

                db.Publicaciones.RemoveRange(publicaciones);

                var relaciones = await db.UsuarioClase
                    .Where(x => x.ClaseId == id)
                    .ToListAsync();

                db.UsuarioClase.RemoveRange(relaciones);

                db.Clases.Remove(clase);

                await db.SaveChangesAsync();

                return Ok(new { message = "Clase eliminada completamente." });
            }

            var rel = await db.UsuarioClase
                .FirstOrDefaultAsync(x => x.ClaseId == id && x.UsuarioId == usuarioId);

            if (rel == null)
                return NotFound(new { message = "No estás inscrito en esta clase." });

            db.UsuarioClase.Remove(rel);
            await db.SaveChangesAsync();

            return Ok(new { message = "Has salido de la clase correctamente." });
        }

        // Devuelve la información básica de una clase por su id
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,profesor,alumno")]
        public async Task<IActionResult> GetClase(int id)
        {
            var clase = await db.Clases.AsNoTracking()
                .Where(c => c.Id == id)
                .Select(c => new { id = c.Id, nombre = c.Nombre, curso = c.Curso, aula = c.Aula, color = c.Color })
                .FirstOrDefaultAsync();

            if (clase == null)
                return NotFound(new { message = "Clase no encontrada." });

            return Ok(clase);
        }
    }
}