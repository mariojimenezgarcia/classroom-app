using classroom.Models;
using System.ComponentModel.DataAnnotations;

namespace classroom.DTOs
{
    public class CrearPublicacionDtos
    {
        public class CrearPublicacionFormDTO
        {
            [Required]
            public TipoPublicacion Tipo { get; set; }

            public string? Titulo { get; set; }

            [Required]
            public string? Contenido { get; set; }

            public DateTime? FechaEntrega { get; set; }

            public int? Puntuacion { get; set; }

            public List<IFormFile>? Archivos { get; set; }
        }
        public class EntregaUpsertDto
        {
            public string? asunto { get; set; }
            public IFormFile? archivo { get; set; }
        }
        public class PonerNotaDto
        {
            public decimal? nota { get; set; }
        }

    }
}
