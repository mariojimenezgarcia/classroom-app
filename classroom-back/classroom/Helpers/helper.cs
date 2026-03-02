using classroom.Models;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace classroom.Helpers
{
    public static class helper
    {
        public static string CreateJwt(IConfiguration config, Usuario user, string rolNombre)
        {
            var jwt = config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.email),
                new Claim("nombre", user.nombre),
                new Claim(ClaimTypes.Role, rolNombre)
            };

            var expires = DateTime.UtcNow.AddMinutes(double.Parse(jwt["ExpiresMinutes"]!));

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public static string GenerarCodigoAcceso()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();

            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)])
                .ToArray());
        }

        public static bool IsValidRol(int rol) => rol >= 1 && rol <= 4;

        public static string MapRol(int rol) => rol switch
        {
            1 => "admin",
            2 => "profesor",
            3 => "alumno",
            4 => "padres",
            _ => throw new ArgumentOutOfRangeException(nameof(rol), "Rol inválido")
        };

        public static int GetUserId(this ClaimsPrincipal user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var idStr =
                user.FindFirstValue(ClaimTypes.NameIdentifier) ??
                user.FindFirstValue("sub") ??
                user.FindFirstValue("id") ??
                user.FindFirstValue("userId");

            if (string.IsNullOrWhiteSpace(idStr) || !int.TryParse(idStr, out var id))
                throw new Exception("No se pudo obtener el id del usuario desde el token.");

            return id;
        }

        public static class AdjuntosHelper
        {
            private class AdjuntoMeta
            {
                public string? nombre { get; set; }
                public string? nombreOriginal { get; set; }
                public long? size { get; set; }
            }

            public static List<object> ObtenerAdjuntosPublicacion(int publicacionId)
            {
                var rutaCarpeta = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "Uploads",
                    "publicaciones",
                    publicacionId.ToString()
                );

                if (!Directory.Exists(rutaCarpeta))
                    return new List<object>();

                var provider = new FileExtensionContentTypeProvider();

                var metaPath = Path.Combine(rutaCarpeta, "meta.json");
                Dictionary<string, AdjuntoMeta> metaMap = new();

                if (File.Exists(metaPath))
                {
                    try
                    {
                        var json = File.ReadAllText(metaPath);
                        var lista = JsonSerializer.Deserialize<List<AdjuntoMeta>>(json) ?? new List<AdjuntoMeta>();

                        metaMap = lista
                            .Where(x => !string.IsNullOrWhiteSpace(x.nombre))
                            .GroupBy(x => x.nombre!)
                            .ToDictionary(g => g.Key, g => g.First());
                    }
                    catch
                    {
                        metaMap = new Dictionary<string, AdjuntoMeta>();
                    }
                }

                var archivos = Directory.GetFiles(rutaCarpeta)
                    .Where(f => !string.Equals(Path.GetFileName(f), "meta.json", StringComparison.OrdinalIgnoreCase))
                    .ToArray();

                return archivos.Select(fullPath =>
                {
                    var nombreGuardado = Path.GetFileName(fullPath);

                    if (!provider.TryGetContentType(nombreGuardado, out var mime))
                        mime = "application/octet-stream";

                    var url = $"/Uploads/publicaciones/{publicacionId}/{nombreGuardado}";

                    metaMap.TryGetValue(nombreGuardado, out var meta);

                    return new
                    {
                        nombre = nombreGuardado,
                        nombreOriginal = meta?.nombreOriginal,
                        size = meta?.size ?? new FileInfo(fullPath).Length,
                        url,
                        mimeType = mime
                    };
                }).Cast<object>().ToList();
            }

            public static async Task GuardarMetaAdjuntoPublicacionAsync(
                string uploadsRoot,
                string nombreGuardado,
                string nombreOriginal,
                long size)
            {
                var metaPath = Path.Combine(uploadsRoot, "meta.json");
                List<AdjuntoMeta> lista;

                if (File.Exists(metaPath))
                {
                    try
                    {
                        var jsonOld = await File.ReadAllTextAsync(metaPath);
                        lista = JsonSerializer.Deserialize<List<AdjuntoMeta>>(jsonOld) ?? new List<AdjuntoMeta>();
                    }
                    catch
                    {
                        lista = new List<AdjuntoMeta>();
                    }
                }
                else
                {
                    lista = new List<AdjuntoMeta>();
                }

                var existente = lista.FirstOrDefault(x =>
                    string.Equals(x.nombre, nombreGuardado, StringComparison.OrdinalIgnoreCase));

                if (existente == null)
                {
                    lista.Add(new AdjuntoMeta
                    {
                        nombre = nombreGuardado,
                        nombreOriginal = nombreOriginal,
                        size = size
                    });
                }
                else
                {
                    existente.nombreOriginal = nombreOriginal;
                    existente.size = size;
                }

                var jsonNew = JsonSerializer.Serialize(lista, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(metaPath, jsonNew);
            }
        }
    }
}