using classroom.Data;
using classroom.DTOs;
using classroom.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace classroom.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext db;

        public AdminController(AppDbContext db)
        {
            this.db = db;
        }

        // Lista usuarios y muestra las clases en las que está inscrito cada uno
        [HttpGet("usuarios-clases")]
        public async Task<ActionResult<List<AdminListDtos>>> UsuariosConClases()
        {
            var data = await db.Usuarios
                .AsNoTracking()
                .Select(u => new AdminListDtos
                {
                    usuarioId = u.Id,
                    nombre = u.nombre,
                    email = u.email,
                    rol = u.rol.ToString(),
                    clases = db.UsuarioClase
                        .AsNoTracking()
                        .Where(uc => uc.UsuarioId == u.Id)
                        .Join(db.Clases.AsNoTracking(),
                              uc => uc.ClaseId,
                              c => c.Id,
                              (uc, c) => c.Nombre)
                        .ToList()
                })
                .ToListAsync();

            return Ok(data);
        }

        // Borra un usuario y elimina sus datos asociados (entregas, publicaciones e inscripciones)
        [HttpDelete("usuarios/{id}")]
        public async Task<IActionResult> BorrarUsuario(int id)
        {
            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado." });

            var clasesCreadas = await db.Clases.AnyAsync(c => c.UsuariosId == id);
            if (clasesCreadas)
                return BadRequest(new { message = "No puedes borrar este usuario porque es creador de una o más clases." });

            var entregasUsuario = await db.Entregas
                .Where(e => e.idusuario == id)
                .ToListAsync();
            db.Entregas.RemoveRange(entregasUsuario);

            var publicacionesUsuarioIds = await db.Publicaciones
                .Where(p => p.AutorId == id)
                .Select(p => p.Id)
                .ToListAsync();

            if (publicacionesUsuarioIds.Count > 0)
            {
                var entregasDeSusPublicaciones = await db.Entregas
                    .Where(e => publicacionesUsuarioIds.Contains(e.publicacionId))
                    .ToListAsync();
                db.Entregas.RemoveRange(entregasDeSusPublicaciones);

                var pubs = await db.Publicaciones
                    .Where(p => publicacionesUsuarioIds.Contains(p.Id))
                    .ToListAsync();
                db.Publicaciones.RemoveRange(pubs);
            }

            var uc = await db.UsuarioClase
                .Where(x => x.UsuarioId == id)
                .ToListAsync();
            db.UsuarioClase.RemoveRange(uc);

            db.Usuarios.Remove(usuario);

            await db.SaveChangesAsync();

            return Ok(new { message = "Usuario borrado completamente." });
        }
    }
}