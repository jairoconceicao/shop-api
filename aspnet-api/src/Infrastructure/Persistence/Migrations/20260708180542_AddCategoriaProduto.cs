using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace aspnet_api.src.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoriaProduto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CategoriasProdutos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategoriasProdutos", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "CategoriasProdutos",
                columns: new[] { "Id", "Titulo", "Descricao" },
                values: new object[] { 1L, "Geral", "Categoria padrao" });

            migrationBuilder.AddColumn<long>(
                name: "CategoriaProdutoId",
                table: "Produtos",
                type: "bigint",
                nullable: false,
                defaultValue: 1L);

            migrationBuilder.CreateIndex(
                name: "IX_Produtos_CategoriaProdutoId",
                table: "Produtos",
                column: "CategoriaProdutoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Produtos_CategoriasProdutos_CategoriaProdutoId",
                table: "Produtos",
                column: "CategoriaProdutoId",
                principalTable: "CategoriasProdutos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Produtos_CategoriasProdutos_CategoriaProdutoId",
                table: "Produtos");

            migrationBuilder.DropIndex(
                name: "IX_Produtos_CategoriaProdutoId",
                table: "Produtos");

            migrationBuilder.DropColumn(
                name: "CategoriaProdutoId",
                table: "Produtos");

            migrationBuilder.DropTable(
                name: "CategoriasProdutos");
        }
    }
}
