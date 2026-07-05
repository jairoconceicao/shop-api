using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace aspnet_api.src.Infrastructure.Persistence.Migrations;

[Migration("20260705140000_AlterClienteDataNascimentoToDate")]
public class AlterClienteDataNascimentoToDate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateOnly>(
            name: "DataNascimento",
            table: "Clientes",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTime>(
            name: "DataNascimento",
            table: "Clientes",
            type: "timestamp with time zone",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date");
    }
}
