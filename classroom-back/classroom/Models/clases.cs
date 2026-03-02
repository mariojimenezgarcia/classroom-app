using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Threading;

namespace classroom.Models
{
    public class Clase
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("Nombre")]
        public string Nombre { get; set; } = "";

        [Column("CodigoAcceso")]
        public string CodigoAcceso { get; set; } = "";

        [Column("UsuariosId")]
        public int UsuariosId { get; set; } 

        [Column("Curso")]
        public string Curso { get; set; } = "";

        [Column("Aula")]
        public string Aula { get; set; } = "";

        [Column("Color")]
        public string Color { get; set; } = "";


        // Navs
        public Usuario? ProfesorCreador { get; set; }
        public List<UsuarioClase> UsuarioClases { get; set; } = new();
        public List<Publicacion> Publicaciones { get; set; } = new();
    }
}
