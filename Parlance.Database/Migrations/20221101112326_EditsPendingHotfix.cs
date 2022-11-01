using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    public partial class EditsPendingHotfix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EditsPending_UserId",
                table: "EditsPending");

            migrationBuilder.CreateIndex(
                name: "IX_EditsPending_UserId_Project_Subproject_Language",
                table: "EditsPending",
                columns: new[] { "UserId", "Project", "Subproject", "Language" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EditsPending_UserId_Project_Subproject_Language",
                table: "EditsPending");

            migrationBuilder.CreateIndex(
                name: "IX_EditsPending_UserId",
                table: "EditsPending",
                column: "UserId",
                unique: true);
        }
    }
}
