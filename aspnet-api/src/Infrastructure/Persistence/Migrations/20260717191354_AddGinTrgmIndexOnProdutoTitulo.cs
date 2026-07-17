using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aspnet_api.src.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGinTrgmIndexOnProdutoTitulo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
            migrationBuilder.Sql("CREATE INDEX IF NOT EXISTS ix_produtos_titulo_trgm ON \"Produtos\" USING gin (\"Titulo\" gin_trgm_ops);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_produtos_titulo_trgm;");
        }
    }
}
