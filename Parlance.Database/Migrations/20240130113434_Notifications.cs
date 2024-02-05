using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Parlance.Database.Migrations
{
    /// <inheritdoc />
    public partial class Notifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationEventAutoSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    Event = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<decimal>(type: "numeric(20,0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationEventAutoSubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationUnsubscriptions",
                columns: table => new
                {
                    UserId = table.Column<decimal>(type: "numeric(20,0)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationUnsubscriptions", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "NotificationSubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Enabled = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<decimal>(type: "numeric(20,0)", nullable: false),
                    Channel = table.Column<string>(type: "text", nullable: false),
                    SubscriptionData = table.Column<string>(type: "text", nullable: false),
                    AutoSubscriptionSourceId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NotificationSubscriptions_NotificationEventAutoSubscription~",
                        column: x => x.AutoSubscriptionSourceId,
                        principalTable: "NotificationEventAutoSubscriptions",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSubscriptions_AutoSubscriptionSourceId",
                table: "NotificationSubscriptions",
                column: "AutoSubscriptionSourceId");

            migrationBuilder.CreateIndex(
                name: "IX_NotificationSubscriptions_UserId_Channel_SubscriptionData",
                table: "NotificationSubscriptions",
                columns: new[] { "UserId", "Channel", "SubscriptionData" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationSubscriptions");

            migrationBuilder.DropTable(
                name: "NotificationUnsubscriptions");

            migrationBuilder.DropTable(
                name: "NotificationEventAutoSubscriptions");
        }
    }
}
