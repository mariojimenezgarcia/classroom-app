using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace classroom.Models
{
    public enum TipoPublicacion
    {
        Anuncio = 0,
        Tarea = 1,
        Examen = 2
    }

    [Table("Publicaciones")]
    public class Publicacion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ClaseId { get; set; }

        [ForeignKey(nameof(ClaseId))]
        public Clase? Clase { get; set; }

        [Required]
        public int AutorId { get; set; }

        [ForeignKey(nameof(AutorId))]
        public Usuario? Autor { get; set; }

        [Required]
        public TipoPublicacion Tipo { get; set; } = TipoPublicacion.Anuncio;

        [MaxLength(150)]
        public string? Titulo { get; set; }

        [Required]
        [MaxLength(500)]
        public string Contenido { get; set; } = string.Empty;

        public DateTime? FechaEntrega { get; set; }

        public int? Puntuacion { get; set; }

        [Required]
        public DateTime FechaCreacion { get; set; } = DateTime.Now;

        // Navs
        public List<Entrega> Entregas { get; set; } = new();
    }
}
