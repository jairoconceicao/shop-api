using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aspnet_api.src.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AlterPedidoDataPedidoToTimestampWithTimeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataPedido",
                table: "Pedidos",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "DataPedido",
                table: "Pedidos",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");
        }
    }
}
