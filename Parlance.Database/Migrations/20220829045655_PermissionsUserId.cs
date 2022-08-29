using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    public partial class PermissionsUserId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Permissions_Username_PermissionType_SpecificPermission",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "Permissions");

            migrationBuilder.AddColumn<decimal>(
                name: "UserId",
                table: "Permissions",
                type: "numeric(20,0)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_UserId_PermissionType_SpecificPermission",
                table: "Permissions",
                columns: new[] { "UserId", "PermissionType", "SpecificPermission" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Permissions_UserId_PermissionType_SpecificPermission",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Permissions");

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Permissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_Username_PermissionType_SpecificPermission",
                table: "Permissions",
                columns: new[] { "Username", "PermissionType", "SpecificPermission" },
                unique: true);
        }
    }
}
