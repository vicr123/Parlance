using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    public partial class AttributionConsents : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttributionConsents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<decimal>(type: "numeric(20,0)", nullable: false),
                    PreferredName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttributionConsents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttributionConsents_UserId",
                table: "AttributionConsents",
                column: "UserId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttributionConsents");
        }
    }
}
