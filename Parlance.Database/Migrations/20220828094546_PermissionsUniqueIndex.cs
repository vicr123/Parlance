using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    public partial class PermissionsUniqueIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Username_PermissionType_SpecificPermission",
                table: "Permissions",
                columns: new[] { "Username", "PermissionType", "SpecificPermission" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Permissions_Username_PermissionType_SpecificPermission",
                table: "Permissions");
        }
    }
}
