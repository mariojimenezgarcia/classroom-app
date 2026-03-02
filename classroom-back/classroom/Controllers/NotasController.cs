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
    public class NotasController : ControllerBase
    {
        private readonly AppDbContext db;

        public NotasController(AppDbContext db)
        {
            this.db = db;
        }

        // Devuelve la lista de hijos vinculados al padre logueado
        [HttpGet("mis-hijos")]
        [Authorize(Roles = "padres")]
        public async Task<ActionResult<List<PadreHijoDto>>> MisHijos()
        {
            int padreId;
            try
            {
                padreId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var hijos = await db.PadreAlumno
                .AsNoTracking()
                .Where(pa => pa.PadreId == padreId && pa.Activo)
                .Join(db.Usuarios.AsNoTracking(),
                      pa => pa.AlumnoId,
                      u => u.Id,
                      (pa, u) => new PadreHijoDto
                      {
                          alumnoId = u.Id,
                          nombre = u.nombre
                      })
                .OrderBy(x => x.nombre)
                .ToListAsync();

            return Ok(hijos);
        }

        // Devuelve las notas del alumno logueado o de un hijo vinculado (si es padre)
        [HttpGet]
        [Authorize(Roles = "alumno,padres")]
        public async Task<ActionResult<List<NotaItemDto>>> GetNotas([FromQuery] int? alumnoId)
        {
            int userId;
            try
            {
                userId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            bool esAlumno = User.IsInRole("alumno");
            bool esPadre = User.IsInRole("padres");

            int alumnoObjetivoId;

            if (esAlumno)
            {
                alumnoObjetivoId = userId;
            }
            else if (esPadre)
            {
                if (alumnoId == null || alumnoId.Value <= 0)
                    return BadRequest(new { message = "Debes indicar alumnoId." });

                alumnoObjetivoId = alumnoId.Value;

                bool vinculado = await db.PadreAlumno
                    .AsNoTracking()
                    .AnyAsync(pa => pa.PadreId == userId && pa.AlumnoId == alumnoObjetivoId && pa.Activo);

                if (!vinculado)
                    return Forbid();
            }
            else
            {
                return Forbid();
            }

            var claseIdsAlumno = db.UsuarioClase
                .AsNoTracking()
                .Where(uc => uc.UsuarioId == alumnoObjetivoId)
                .Select(uc => uc.ClaseId)
                .Distinct();

            var data = await db.Publicaciones
                .AsNoTracking()
                .Where(p =>
                    (p.Tipo == TipoPublicacion.Tarea || p.Tipo == TipoPublicacion.Examen) &&
                    claseIdsAlumno.Contains(p.ClaseId)
                )
                .GroupJoin(
                    db.Entregas.AsNoTracking().Where(e => e.idusuario == alumnoObjetivoId),
                    p => p.Id,
                    e => e.publicacionId,
                    (p, entregas) => new { p, entregas }
                )
                .SelectMany(
                    x => x.entregas.DefaultIfEmpty(),
                    (x, e) => new { x.p, e }
                )
                .Join(
                    db.Clases.AsNoTracking(),
                    pe => pe.p.ClaseId,
                    c => c.Id,
                    (pe, c) => new NotaItemDto
                    {
                        claseId = c.Id,
                        nombreClase = c.Nombre,
                        publicacionId = pe.p.Id,
                        titulo = pe.p.Titulo ?? "(sin título)",
                        tipo = pe.p.Tipo == TipoPublicacion.Examen ? "Examen" : "Tarea",
                        fechaEntrega = pe.p.FechaEntrega,
                        fechaEntregada = pe.e != null ? pe.e.fecha_entrega : null,
                        nota = pe.e != null ? pe.e.nota : null,
                        puntuacionMaxima = pe.p.Puntuacion
                    }
                )
                .OrderBy(x => x.nombreClase)
                .ThenBy(x => x.fechaEntrega ?? DateTime.MaxValue)
                .ToListAsync();

            return Ok(data);
        }

        // Permite a un padre vincularse a un alumno mediante su código
        [HttpPost("vincular")]
        [Authorize(Roles = "padres")]
        public async Task<IActionResult> Vincular([FromBody] VincularHijoDto dto)
        {
            int padreId;
            try
            {
                padreId = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var codigo = (dto.codigoAlumno ?? "").Trim().ToUpper();
            if (string.IsNullOrWhiteSpace(codigo))
                return BadRequest(new { message = "codigoAlumno es obligatorio." });

            var alumno = await db.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.codigoAlumno == codigo && u.rol == 3);

            if (alumno == null)
                return BadRequest(new { message = "Código no válido." });

            bool existe = await db.PadreAlumno
                .AnyAsync(pa => pa.PadreId == padreId && pa.AlumnoId == alumno.Id);

            if (!existe)
            {
                db.PadreAlumno.Add(new PadreAlumno
                {
                    PadreId = padreId,
                    AlumnoId = alumno.Id,
                    FechaVinculo = DateTime.Now,
                    Activo = true
                });

                await db.SaveChangesAsync();
            }
            else
            {
                var rel = await db.PadreAlumno
                    .FirstOrDefaultAsync(pa => pa.PadreId == padreId && pa.AlumnoId == alumno.Id);

                if (rel != null && !rel.Activo)
                {
                    rel.Activo = true;
                    await db.SaveChangesAsync();
                }
            }

            return Ok(new
            {
                message = "Alumno vinculado correctamente.",
                alumnoId = alumno.Id,
                nombre = alumno.nombre
            });
        }
    }
}