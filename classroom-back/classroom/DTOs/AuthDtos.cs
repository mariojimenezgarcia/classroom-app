namespace classroom.DTOs
{
    public class RegisterDto
    {
        public string nombre { get; set; } = "";
        public string email { get; set; } = "";
        public string password { get; set; } = "";
        public int rol { get; set; } = 3; 
    }

    public class LoginDto
    {
        public string email { get; set; } = "";
        public string password { get; set; } = "";
    }

    public class AuthResponseDto
    {
        public string token { get; set; } = "";
        public int userId { get; set; }
        public string nombre { get; set; } = "";
        public string email { get; set; } = "";
        public string rol { get; set; } = "";
        public string fotoUrl { get; set; } = "";
    }
}
