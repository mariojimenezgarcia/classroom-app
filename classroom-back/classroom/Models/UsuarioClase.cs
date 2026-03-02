using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace classroom.Models
{
    public class UsuarioClase
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("usuarioId")]
        public int UsuarioId { get; set; }

        [Column("claseId")]
        public int ClaseId { get; set; }

        // Navs
        public Usuario? Usuario { get; set; }
        public Clase? Clase { get; set; }
    }
}
