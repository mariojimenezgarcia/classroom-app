using classroom.Data;
using classroom.DTOs;
using classroom.Errors;
using classroom.Helpers;
using classroom.Models;
using classroom.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace classroom.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext db;
        private readonly IConfiguration config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            this.db = db;
            this.config = config;
        }

        // Registra un usuario nuevo (alumno/profesor/padres/admin según rol) y genera código si es alumno
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var email = dto.email.Trim().ToLower();

            if (!helper.IsValidRol(dto.rol))
                return BadRequest(ApiErrors.Create(ErrorMessages.RolInvalido));

            bool exists = await db.Usuarios.AnyAsync(u => u.email.ToLower() == email);
            if (exists)
                return BadRequest(ApiErrors.Create(ErrorMessages.EmailYaExiste));

            var user = new Usuario
            {
                nombre = dto.nombre,
                email = email,
                password = PasswordHasher.Hash(dto.password),
                rol = dto.rol
            };

            if (dto.rol == 3)
                user.codigoAlumno = helper.GenerarCodigoAcceso();

            db.Usuarios.Add(user);

            try
            {
                await db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (dto.rol == 3)
                {
                    user.codigoAlumno = helper.GenerarCodigoAcceso();
                    await db.SaveChangesAsync();
                }
                else
                {
                    throw;
                }
            }

            return Ok(new { message = "Usuario creado correctamente." });
        }

        // Inicia sesión con email y contraseña y devuelve el token JWT y los datos básicos del usuario
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var email = dto.email.Trim().ToLower();

            var user = await db.Usuarios.FirstOrDefaultAsync(u => u.email.ToLower() == email);
            if (user == null)
                return Unauthorized(ApiErrors.Create(ErrorMessages.CredencialesIncorrectas));

            if (!PasswordHasher.Verify(dto.password, user.password))
                return Unauthorized(ApiErrors.Create(ErrorMessages.CredencialesIncorrectas));

            string rolNombre;
            try
            {
                rolNombre = helper.MapRol(user.rol);
            }
            catch
            {
                return StatusCode(500, ApiErrors.Create(ErrorMessages.RolInvalidoEnBd));
            }

            string token = helper.CreateJwt(config, user, rolNombre);

            var response = new AuthResponseDto
            {
                token = token,
                userId = user.Id,
                nombre = user.nombre,
                email = user.email,
                rol = rolNombre,
                fotoUrl = user.fotoUrl
            };

            return Ok(response);
        }
    }
}