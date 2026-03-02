using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading;

namespace classroom.Models
{
    public class Usuario
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        public string nombre { get; set; } = "";

        [Column("email")]
        public string email { get; set; } = "";

        [Column("password")]
        public string password { get; set; } = "";

        [Column("rol")]
        public int rol { get; set; }

        [Column("fotoUrl")]
        public string? fotoUrl { get; set; }

        [Column("codigoAlumno")]
        public string? codigoAlumno { get; set; }


        // Navs
        public List<UsuarioClase> UsuarioClases { get; set; } = new();
        public List<Clase> ClasesCreadas { get; set; } = new(); 
        public List<Entrega> Entregas { get; set; } = new();
        public List<Publicacion> Publicaciones { get; set; } = new();
        public List<PadreAlumno> Hijos { get; set; } = new();
        public List<PadreAlumno> Padres { get; set; } = new();

    }
}
