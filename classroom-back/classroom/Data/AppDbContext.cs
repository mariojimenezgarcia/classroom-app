using Microsoft.EntityFrameworkCore;
using classroom.Models;

namespace classroom.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios => Set<Usuario>();
        public DbSet<Clase> Clases => Set<Clase>();
        public DbSet<UsuarioClase> UsuarioClase => Set<UsuarioClase>();
        public DbSet<Publicacion> Publicaciones => Set<Publicacion>();
        public DbSet<Entrega> Entregas => Set<Entrega>();

        // ✅ NUEVO
        public DbSet<PadreAlumno> PadreAlumno => Set<PadreAlumno>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tablas
            modelBuilder.Entity<Usuario>().ToTable("Usuarios");
            modelBuilder.Entity<Clase>().ToTable("Clases");
            modelBuilder.Entity<UsuarioClase>().ToTable("UsuarioClase");
            modelBuilder.Entity<Publicacion>().ToTable("Publicaciones");
            modelBuilder.Entity<Entrega>().ToTable("Entregas");

            // ✅ NUEVO
            modelBuilder.Entity<PadreAlumno>().ToTable("PadreAlumno");

            // UsuarioClase: evitar duplicados
            modelBuilder.Entity<UsuarioClase>()
                .HasIndex(x => new { x.UsuarioId, x.ClaseId })
                .IsUnique();

            // UsuarioClase -> Usuario
            modelBuilder.Entity<UsuarioClase>()
                .HasOne(uc => uc.Usuario)
                .WithMany(u => u.UsuarioClases)
                .HasForeignKey(uc => uc.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            // UsuarioClase -> Clase
            modelBuilder.Entity<UsuarioClase>()
                .HasOne(uc => uc.Clase)
                .WithMany(c => c.UsuarioClases)
                .HasForeignKey(uc => uc.ClaseId)
                .OnDelete(DeleteBehavior.Cascade);

            // Clase -> Usuario (profesor creador)
            modelBuilder.Entity<Clase>()
                .HasOne(c => c.ProfesorCreador)
                .WithMany(u => u.ClasesCreadas)
                .HasForeignKey(c => c.UsuariosId)
                .OnDelete(DeleteBehavior.Restrict);

            // Publicaciones -> Usuario (autor)
            modelBuilder.Entity<Publicacion>()
                .HasOne(p => p.Autor)
                .WithMany(u => u.Publicaciones)
                .HasForeignKey(p => p.AutorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Publicaciones -> Clase
            modelBuilder.Entity<Publicacion>()
                .HasOne(p => p.Clase)
                .WithMany(c => c.Publicaciones)
                .HasForeignKey(p => p.ClaseId)
                .OnDelete(DeleteBehavior.Cascade);

            // Entregas -> Publicacion
            modelBuilder.Entity<Entrega>()
                .HasOne(e => e.Publicacion)
                .WithMany(p => p.Entregas)
                .HasForeignKey(e => e.publicacionId)
                .OnDelete(DeleteBehavior.Cascade);

            // Entregas -> Usuario
            modelBuilder.Entity<Entrega>()
                .HasOne(e => e.Usuario)
                .WithMany(u => u.Entregas)
                .HasForeignKey(e => e.idusuario)
                .OnDelete(DeleteBehavior.Restrict);

            // Evitar duplicados padre-alumno
            modelBuilder.Entity<PadreAlumno>()
                .HasIndex(x => new { x.PadreId, x.AlumnoId })
                .IsUnique();

            // PadreAlumno -> Usuario (Padre)
            modelBuilder.Entity<PadreAlumno>()
                .HasOne(pa => pa.Padre)
                .WithMany(u => u.Hijos)
                .HasForeignKey(pa => pa.PadreId)
                .OnDelete(DeleteBehavior.Restrict);

            // PadreAlumno -> Usuario (Alumno)
            modelBuilder.Entity<PadreAlumno>()
                .HasOne(pa => pa.Alumno)
                .WithMany(u => u.Padres)
                .HasForeignKey(pa => pa.AlumnoId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}