using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace classroom.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    password = table.Column<string>(type: "text", nullable: false),
                    rol = table.Column<int>(type: "integer", nullable: false),
                    fotoUrl = table.Column<string>(type: "text", nullable: true),
                    codigoAlumno = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Clases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    CodigoAcceso = table.Column<string>(type: "text", nullable: false),
                    UsuariosId = table.Column<int>(type: "integer", nullable: false),
                    Curso = table.Column<string>(type: "text", nullable: false),
                    Aula = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clases_Usuarios_UsuariosId",
                        column: x => x.UsuariosId,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PadreAlumno",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PadreId = table.Column<int>(type: "integer", nullable: false),
                    AlumnoId = table.Column<int>(type: "integer", nullable: false),
                    FechaVinculo = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Activo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PadreAlumno", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PadreAlumno_Usuarios_AlumnoId",
                        column: x => x.AlumnoId,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PadreAlumno_Usuarios_PadreId",
                        column: x => x.PadreId,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Publicaciones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClaseId = table.Column<int>(type: "integer", nullable: false),
                    AutorId = table.Column<int>(type: "integer", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Contenido = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FechaEntrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Puntuacion = table.Column<int>(type: "integer", nullable: true),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Publicaciones", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Publicaciones_Clases_ClaseId",
                        column: x => x.ClaseId,
                        principalTable: "Clases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Publicaciones_Usuarios_AutorId",
                        column: x => x.AutorId,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UsuarioClase",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    usuarioId = table.Column<int>(type: "integer", nullable: false),
                    claseId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsuarioClase", x => x.id);
                    table.ForeignKey(
                        name: "FK_UsuarioClase_Clases_claseId",
                        column: x => x.claseId,
                        principalTable: "Clases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UsuarioClase_Usuarios_usuarioId",
                        column: x => x.usuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entregas",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    publicacionId = table.Column<int>(type: "integer", nullable: false),
                    idusuario = table.Column<int>(type: "integer", nullable: false),
                    asunto = table.Column<string>(type: "text", nullable: false),
                    archivo = table.Column<string>(type: "text", nullable: false),
                    archivoNombreOriginal = table.Column<string>(type: "text", nullable: true),
                    archivoMimeType = table.Column<string>(type: "text", nullable: true),
                    archivoSize = table.Column<long>(type: "bigint", nullable: true),
                    fecha_entrega = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    entregada = table.Column<bool>(type: "boolean", nullable: false),
                    nota = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entregas", x => x.id);
                    table.ForeignKey(
                        name: "FK_Entregas_Publicaciones_publicacionId",
                        column: x => x.publicacionId,
                        principalTable: "Publicaciones",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Entregas_Usuarios_idusuario",
                        column: x => x.idusuario,
                        principalTable: "Usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Clases_UsuariosId",
                table: "Clases",
                column: "UsuariosId");

            migrationBuilder.CreateIndex(
                name: "IX_Entregas_idusuario",
                table: "Entregas",
                column: "idusuario");

            migrationBuilder.CreateIndex(
                name: "IX_Entregas_publicacionId",
                table: "Entregas",
                column: "publicacionId");

            migrationBuilder.CreateIndex(
                name: "IX_PadreAlumno_AlumnoId",
                table: "PadreAlumno",
                column: "AlumnoId");

            migrationBuilder.CreateIndex(
                name: "IX_PadreAlumno_PadreId_AlumnoId",
                table: "PadreAlumno",
                columns: new[] { "PadreId", "AlumnoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Publicaciones_AutorId",
                table: "Publicaciones",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Publicaciones_ClaseId",
                table: "Publicaciones",
                column: "ClaseId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioClase_claseId",
                table: "UsuarioClase",
                column: "claseId");

            migrationBuilder.CreateIndex(
                name: "IX_UsuarioClase_usuarioId_claseId",
                table: "UsuarioClase",
                columns: new[] { "usuarioId", "claseId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Entregas");

            migrationBuilder.DropTable(
                name: "PadreAlumno");

            migrationBuilder.DropTable(
                name: "UsuarioClase");

            migrationBuilder.DropTable(
                name: "Publicaciones");

            migrationBuilder.DropTable(
                name: "Clases");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
