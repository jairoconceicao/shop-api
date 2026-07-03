using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace aspnet_api.src.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Carrinhos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<long>(type: "bigint", nullable: false),
                    EnderecoEntrega_Logradouro = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EnderecoEntrega_Numero = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EnderecoEntrega_Complemento = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EnderecoEntrega_Cep = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EnderecoEntrega_Bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EnderecoEntrega_Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EnderecoEntrega_Uf = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    DataCarrinho = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carrinhos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clientes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Cpf = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Logradouro = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Numero = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Complemento = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Cep = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Uf = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    CelularDdd = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    CelularNumero = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CelularWhatsApp = table.Column<bool>(type: "boolean", nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clientes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estoques",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DataMovimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProdutoId = table.Column<long>(type: "bigint", nullable: false),
                    QuantidadeMinima = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    QuantidadeMaxima = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    QuantidadeAtual = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estoques", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Pedidos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataPedido = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClienteId = table.Column<long>(type: "bigint", nullable: false),
                    CarrinhoId = table.Column<long>(type: "bigint", nullable: true),
                    EnderecoEntrega_Logradouro = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EnderecoEntrega_Numero = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EnderecoEntrega_Complemento = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EnderecoEntrega_Cep = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    EnderecoEntrega_Bairro = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EnderecoEntrega_Cidade = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    EnderecoEntrega_Uf = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    FormaPagamento = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Produtos",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Modelo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Preco = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Foto = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Thumb = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produtos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CarrinhoItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    ProdutoId = table.Column<long>(type: "bigint", nullable: false),
                    Quantidade = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CarrinhoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CarrinhoItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CarrinhoItems_Carrinhos_CarrinhoId",
                        column: x => x.CarrinhoId,
                        principalTable: "Carrinhos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClienteId = table.Column<long>(type: "bigint", nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SenhaHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Clientes_ClienteId",
                        column: x => x.ClienteId,
                        principalTable: "Clientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimentosEstoque",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EstoqueId = table.Column<long>(type: "bigint", nullable: false),
                    DataMovimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OperacaoCodigo = table.Column<int>(type: "integer", nullable: false),
                    OperacaoTipo = table.Column<int>(type: "integer", nullable: false),
                    OperacaoDescricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Quantidade = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentosEstoque", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimentosEstoque_Estoques_EstoqueId",
                        column: x => x.EstoqueId,
                        principalTable: "Estoques",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PedidoItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    ProdutoId = table.Column<long>(type: "bigint", nullable: false),
                    Quantidade = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    PedidoId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidoItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PedidoItems_Pedidos_PedidoId",
                        column: x => x.PedidoId,
                        principalTable: "Pedidos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Sessoes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<long>(type: "bigint", nullable: false),
                    Jti = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiraEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevogadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sessoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sessoes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CarrinhoItems_CarrinhoId",
                table: "CarrinhoItems",
                column: "CarrinhoId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentosEstoque_EstoqueId",
                table: "MovimentosEstoque",
                column: "EstoqueId");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoItems_PedidoId",
                table: "PedidoItems",
                column: "PedidoId");

            migrationBuilder.CreateIndex(
                name: "IX_Sessoes_Jti",
                table: "Sessoes",
                column: "Jti",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sessoes_UsuarioId",
                table: "Sessoes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_ClienteId",
                table: "Usuarios",
                column: "ClienteId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CarrinhoItems");

            migrationBuilder.DropTable(
                name: "MovimentosEstoque");

            migrationBuilder.DropTable(
                name: "PedidoItems");

            migrationBuilder.DropTable(
                name: "Produtos");

            migrationBuilder.DropTable(
                name: "Sessoes");

            migrationBuilder.DropTable(
                name: "Carrinhos");

            migrationBuilder.DropTable(
                name: "Estoques");

            migrationBuilder.DropTable(
                name: "Pedidos");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Clientes");
        }
    }
}


