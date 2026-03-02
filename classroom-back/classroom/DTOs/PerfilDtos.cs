namespace classroom.DTOs
{
    public class PerfilDtos
    {
        public class UsuarioUpdateFormDto
        {
            public string? nombre { get; set; }
            public string? email { get; set; }
            public string? password { get; set; }
            public bool quitarFoto { get; set; }  
            public IFormFile? foto { get; set; }   
        }
    }
}
