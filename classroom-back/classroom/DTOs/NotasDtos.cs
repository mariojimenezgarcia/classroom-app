namespace classroom.DTOs
{
    public class VincularHijoDto
    {
        public string? codigoAlumno { get; set; }
    }

    public class PadreHijoDto
    {
        public int alumnoId { get; set; }
        public string nombre { get; set; } = "";
    }

    public class NotaItemDto
    {
        public int claseId { get; set; }
        public string nombreClase { get; set; } = "";

        public int publicacionId { get; set; }
        public string titulo { get; set; } = "";

        public string tipo { get; set; } = ""; 

        public DateTime? fechaEntrega { get; set; }    
        public DateTime? fechaEntregada { get; set; }    

        public decimal? nota { get; set; }
        public int? puntuacionMaxima { get; set; }
    }
}