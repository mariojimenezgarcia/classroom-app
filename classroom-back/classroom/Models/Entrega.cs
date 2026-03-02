using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace classroom.Models
{
    public class Entrega
    {
        [Key]
        [Column("id")]
        public int id { get; set; }

        [Column("publicacionId")]
        public int publicacionId { get; set; }

        [Column("idusuario")]
        public int idusuario { get; set; }

        [Column("asunto")]
        public string asunto { get; set; } = "";

        [Column("archivo")]
        public string archivo { get; set; } = "";

        [Column("archivoNombreOriginal")]
        public string? archivoNombreOriginal { get; set; }

        [Column("archivoMimeType")]
        public string? archivoMimeType { get; set; }

        [Column("archivoSize")]
        public long? archivoSize { get; set; }

        [Column("fecha_entrega")]
        public DateTime? fecha_entrega { get; set; }

        [Column("entregada")]
        public bool entregada { get; set; } = false;

        [Column("nota")]
        public decimal? nota { get; set; }

        public Publicacion? Publicacion { get; set; }
        public Usuario? Usuario { get; set; }
    }
}
