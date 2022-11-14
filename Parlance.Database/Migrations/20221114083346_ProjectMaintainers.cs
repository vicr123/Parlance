using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    /// <inheritdoc />
    public partial class ProjectMaintainers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProjectMaintainers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<decimal>(type: "numeric(20,0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectMaintainers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectMaintainers_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectMaintainers_ProjectId_UserId",
                table: "ProjectMaintainers",
                columns: new[] { "ProjectId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProjectMaintainers");
        }
    }
}
