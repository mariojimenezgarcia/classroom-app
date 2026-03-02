namespace classroom.DTOs
{
    public class ClaseCardDtos
    {
        public int id { get; set; }
        public string nombre { get; set; } = "";
        public string? curso { get; set; }
        public string? aula { get; set; }
        public string? color { get; set; }
        public string? profesorNombre { get; set; }
        public string? imagenUrl { get; set; } 
    }
    public class ClaseCreateDto
    {
        public string nombre { get; set; } = "";
        public string curso { get; set; } = "";
        public string aula { get; set; } = "";
        public string color { get; set; } = "";
    }
    public class UnirseClaseDto
    {
        public string codigoAcceso { get; set; } = "";
    }
    public class ClasePersonasDto
    {
        public int claseId { get; set; }
        public string nombreClase { get; set; } = "";
        public string? curso { get; set; }
        public string? aula { get; set; }
        public List<ClasePersonaRowDto> personas { get; set; } = new();
    }

    public class ClasePersonaRowDto
    {
        public int usuarioId { get; set; }
        public string nombre { get; set; } = "";
        public string email { get; set; } = "";
        public string rol { get; set; } = "";
    }
    public class ClaseUpdateDto
    {
        public string nombre { get; set; } = "";
        public string curso { get; set; } = "";
        public string aula { get; set; } = "";
        public string color { get; set; } = "";
    }
}
