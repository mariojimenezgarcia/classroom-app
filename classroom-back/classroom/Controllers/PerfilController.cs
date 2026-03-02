using classroom.Data;
using classroom.DTOs;
using classroom.Helpers;
using classroom.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static classroom.DTOs.PerfilDtos;

namespace classroom.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PerfilController : ControllerBase
    {
        private readonly AppDbContext db;

        public PerfilController(AppDbContext db)
        {
            this.db = db;
        }

        // Devuelve los datos del perfil de un usuario (solo admin puede consultar a otros)
        [HttpGet("{id}")]
        [Authorize(Roles = "admin,profesor,alumno,padres")]
        public async Task<IActionResult> GetUsuario(int id)
        {
            int usuarioIdToken;
            try
            {
                usuarioIdToken = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var rolToken = (User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "")
                .ToLower();

            if (rolToken != "admin" && id != usuarioIdToken)
                return Forbid();

            var usuario = await db.Usuarios.AsNoTracking()
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    id = u.Id,
                    nombre = u.nombre,
                    email = u.email,
                    fotoUrl = u.fotoUrl,
                    codigoAlumno = u.codigoAlumno
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado." });

            return Ok(usuario);
        }

        // Actualiza el perfil (nombre, email, contraseña y foto). Solo admin puede editar a otros usuarios
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,profesor,alumno,padres")]
        [RequestSizeLimit(10_000_000)]
        public async Task<IActionResult> EditarUsuario(int id, [FromForm] UsuarioUpdateFormDto dto)
        {
            int usuarioIdToken;
            try
            {
                usuarioIdToken = User.GetUserId();
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }

            var rolToken = (User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value ?? "")
                .ToLower();

            if (rolToken != "admin" && id != usuarioIdToken)
                return Forbid();

            var usuario = await db.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado." });

            var nombre = dto.nombre?.Trim() ?? "";
            var email = dto.email?.Trim().ToLower() ?? "";

            if (string.IsNullOrWhiteSpace(nombre) || string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Nombre y email son obligatorios." });

            var emailExiste = await db.Usuarios.AsNoTracking()
                .AnyAsync(u => u.Id != id && u.email != null && u.email.ToLower() == email);

            if (emailExiste)
                return BadRequest(new { message = "Ese email ya está en uso." });

            usuario.nombre = nombre;
            usuario.email = email;

            if (!string.IsNullOrWhiteSpace(dto.password))
            {
                if (dto.password.Length < 6)
                    return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres." });

                usuario.password = PasswordHasher.Hash(dto.password);
            }

            if (dto.quitarFoto)
                usuario.fotoUrl = null;

            if (dto.foto != null && dto.foto.Length > 0)
            {
                if (!dto.foto.ContentType.StartsWith("image/"))
                    return BadRequest(new { message = "Solo se permiten imágenes." });

                var uploadsRoot = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Uploads",
                    "perfiles",
                    id.ToString()
                );

                Directory.CreateDirectory(uploadsRoot);

                var ext = Path.GetExtension(dto.foto.FileName);
                var fileName = $"{Guid.NewGuid():N}{ext}";
                var fullPath = Path.Combine(uploadsRoot, fileName);

                using (var stream = System.IO.File.Create(fullPath))
                    await dto.foto.CopyToAsync(stream);

                usuario.fotoUrl = $"/Uploads/perfiles/{id}/{fileName}";
            }

            await db.SaveChangesAsync();

            return Ok(new
            {
                message = "Perfil actualizado correctamente",
                usuarioId = usuario.Id,
                fotoUrl = usuario.fotoUrl
            });
        }
    }
}