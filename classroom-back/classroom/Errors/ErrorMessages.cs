namespace classroom.Errors
{
    public static class ErrorMessages
    {
        public const string RolInvalido = "Rol inválido. Debe ser 1=admin, 2=profesor, 3=alumno, 4=padres.";
        public const string EmailYaExiste = "El email ya existe.";
        public const string CredencialesIncorrectas = "Credenciales incorrectas.";
        public const string RolInvalidoEnBd = "Rol inválido en la base de datos.";
    }

    public class ApiError
    {     
        public string message { get; set; } = "";
    }
    public static class ApiErrors
    {
        public static ApiError Create( string message)
            => new ApiError {  message = message };
    }
}
