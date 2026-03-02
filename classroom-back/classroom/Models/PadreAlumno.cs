using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace classroom.Models
{
    public class PadreAlumno
    {
        [Key]
        [Column("Id")]
        public int Id { get; set; }

        [Column("PadreId")]
        public int PadreId { get; set; }

        [Column("AlumnoId")]
        public int AlumnoId { get; set; }

        [Column("FechaVinculo")]
        public DateTime FechaVinculo { get; set; }

        [Column("Activo")]
        public bool Activo { get; set; }

        [ForeignKey("PadreId")]
        public Usuario Padre { get; set; } = null!;

        [ForeignKey("AlumnoId")]
        public Usuario Alumno { get; set; } = null!;
    }
}