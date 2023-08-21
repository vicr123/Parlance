using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    /// <inheritdoc />
    public partial class Glossary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Glossaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreatedDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Glossaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GlossaryItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Term = table.Column<string>(type: "text", nullable: false),
                    Translation = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    GlossaryId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlossaryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GlossaryItems_Glossaries_GlossaryId",
                        column: x => x.GlossaryId,
                        principalTable: "Glossaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GlossaryProject",
                columns: table => new
                {
                    GlossariesId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlossaryProject", x => new { x.GlossariesId, x.ProjectsId });
                    table.ForeignKey(
                        name: "FK_GlossaryProject_Glossaries_GlossariesId",
                        column: x => x.GlossariesId,
                        principalTable: "Glossaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GlossaryProject_Projects_ProjectsId",
                        column: x => x.ProjectsId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Glossaries_Name",
                table: "Glossaries",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GlossaryItems_GlossaryId",
                table: "GlossaryItems",
                column: "GlossaryId");

            migrationBuilder.CreateIndex(
                name: "IX_GlossaryProject_ProjectsId",
                table: "GlossaryProject",
                column: "ProjectsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GlossaryItems");

            migrationBuilder.DropTable(
                name: "GlossaryProject");

            migrationBuilder.DropTable(
                name: "Glossaries");
        }
    }
}
