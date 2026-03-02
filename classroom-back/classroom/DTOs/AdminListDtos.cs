namespace classroom.DTOs
{
    public class AdminListDtos
    {
        public int usuarioId { get; set; }
        public string nombre { get; set; } = "";
        public string email { get; set; } = "";
        public string rol { get; set; } = "";
        public List<string> clases { get; set; } = new();
    }
}
