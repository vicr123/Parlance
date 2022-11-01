using Microsoft.EntityFrameworkCore;
using Parlance.Database.Models;

namespace Parlance.Database;

public class ParlanceContext : DbContext
{
    public ParlanceContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<SshKey> SshKeys { get; set; } = null!;
    public DbSet<SshTrustedServer> SshTrustedServers { get; set; } = null!;
    public DbSet<Superuser> Superusers { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;
    public DbSet<IndexItem> Index { get; set; } = null!;
    public DbSet<Alert> Alerts { get; set; } = null!;
    public DbSet<SourceStrings> SourceStrings { get; set; } = null!;
    public DbSet<AttributionConsent> AttributionConsents { get; set; } = null!;
    public DbSet<EditsPending> EditsPending { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SshKey>().ToTable("SshKeys");
        modelBuilder.Entity<SshTrustedServer>().ToTable("SshTrustedServers");
        modelBuilder.Entity<Superuser>().ToTable("Superusers");
        modelBuilder.Entity<Project>().ToTable("Projects")
            .HasIndex(p => p.Name).IsUnique();
        modelBuilder.Entity<Permission>().ToTable("Permissions");
        modelBuilder.Entity<IndexItem>().ToTable("Index");
        modelBuilder.Entity<Alert>().ToTable("Alerts");
        modelBuilder.Entity<SourceStrings>().ToTable("SourceStrings");
        modelBuilder.Entity<AttributionConsent>().ToTable("AttributionConsents");
        modelBuilder.Entity<EditsPending>().ToTable("EditsPending");
    }
}

public static class ParlanceInitializer
{
    public static async Task Initialize(this ParlanceContext context)
    {
        await context.Database.MigrateAsync();
    }
}