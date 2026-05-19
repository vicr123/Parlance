using System.Net;
using System.Threading.RateLimiting;
using MessagePipe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Parlance;
using Parlance.Authorization.LanguageEditor;
using Parlance.Authorization.ProjectAdministrator;
using Parlance.Authorization.Superuser;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Glossary;
using Parlance.Hubs;
using Parlance.Jobs;
using Parlance.Notifications;
using Parlance.Project;
using Parlance.RateLimiting;
using Parlance.Services.Comments;
using Parlance.Services.Permissions;
using Parlance.Services.ProjectMaintainers;
using Parlance.Services.Projects;
using Parlance.Services.ProjectUpdater;
using Parlance.Services.RemoteCommunication;
using Parlance.Services.Superuser;
using Parlance.VersionControl;
using Parlance.VersionControl.Services;
using Parlance.Vicr123Accounts;
using Parlance.Vicr123Accounts.Services.AttributionConsent;
using Quartz;
using Quartz.AspNetCore;

Console.WriteLine("""
 _____ _   ____________________________________
|     \ /   |  _ \   _ __| |    _ __ ___|  __|
| ____//    |  __/-'| '__| /--'| '_ / __|  __|
| |\  /     | || [] | [  || [] | | [ [__| [__
|_| \/(_)  _|_| \___|_|__|_\___|_| |\___|____|_

========================================
""");

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddVicr123Accounts(builder.Configuration);
builder.Services.AddVersionControl(builder.Configuration);
builder.Services.AddParlanceProjects(builder.Configuration);
builder.Services.AddGlossary(builder.Configuration);
builder.Services.AddNotifications(builder.Configuration);
builder.Services.AddMessagePipe();

try
{
    await builder.Services.AddCldrAsync(builder.Configuration);
}
catch
{
    Console.WriteLine("CLDR data could not be downloaded");
}

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ISuperuserService, SuperuserService>();
builder.Services.AddScoped<IRemoteCommunicationService, RemoteCommunicationService>();
builder.Services.AddScoped<IPermissionsService, PermissionsService>();
builder.Services.AddScoped<IAttributionConsentService, AttributionConsentService>();
builder.Services.AddScoped<IProjectMaintainersService, ProjectMaintainersService>();
builder.Services.AddScoped<ICommentsService, CommentsService>();
builder.Services.AddSingleton<IProjectUpdateQueue, ProjectUpdateQueue>();

builder.Services.AddHostedService<ProjectUpdaterService>();

builder.Services.Configure<ParlanceOptions>(builder.Configuration.GetSection("Parlance"));
builder.Services.Configure<RateLimitingOptions>(builder.Configuration.GetSection("rateLimiting"));
builder.Services.Configure<ForwardedHeadersOptions>(builder.Configuration.GetSection("ForwardedHeaders"));

SqliteConnection? connection = null;

builder.Services.AddDbContext<ParlanceContext>(options =>
{
    var parlanceOptions = builder.Configuration.GetRequiredSection("Parlance").Get<ParlanceOptions>()!;
    if (parlanceOptions.UseSqliteDatabase)
    {
        connection ??= new SqliteConnection($"Data Source=\"{Path.Join(parlanceOptions.RepositoryDirectory, "Parlance.db")}\"");
        connection.Open();
        options.UseSqlite(connection);
    }
    else
    {
        options.UseNpgsql(parlanceOptions.DatabaseConnectionString,
            optionsBuilder => optionsBuilder.EnableRetryOnFailure());
    }
});

builder.Services.AddScoped<IAuthorizationHandler, LanguageEditorHandler>();
builder.Services.AddScoped<IAuthorizationHandler, SuperuserHandler>();
builder.Services.AddScoped<IAuthorizationHandler, ProjectManagerHandler>();

builder.Services.AddQuartz(q =>
{
    q.ScheduleJob<ProjectCommitJob>(trigger => trigger
        .WithSimpleSchedule(x => x
            .WithIntervalInMinutes(60)
            .RepeatForever()
            .WithMisfireHandlingInstructionNowWithRemainingCount()
        )
    );
});
builder.Services.AddQuartzServer(options => options.WaitForJobsToComplete = true);

builder.Services.AddAuthorizationCore(options =>
{
    options.AddPolicy("LanguageEditor", policy => policy.Requirements.Add(new LanguageEditorRequirement()));
    options.AddPolicy("Superuser", policy => policy.Requirements.Add(new SuperuserRequirement()));
    options.AddPolicy("ProjectManager", policy => policy.Requirements.Add(new ProjectManagerRequirement()));
});

builder.Services.AddResponseCompression(options => options.EnableForHttps = true);

builder.Services.AddRateLimiter(x =>
{
    x.OnRejected = (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        return new ValueTask();
    };

    x.AddPolicy<IPAddress, StandardRateLimitingPolicy>("limiter");
    x.AddPolicy<IPAddress, UserTokenRateLimitingPolicy>("login");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();

app.UseHttpsRedirection();
app.UseResponseCompression();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapFallbackToFile("index.html");
app.MapDefaultControllerRoute();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await services.GetRequiredService<ParlanceContext>().Initialize();
}

app.UseRateLimiter();
app.MapHub<TranslatorHub>("/api/signalr/translator");

app.Run();