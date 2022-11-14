using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Parlance;
using Parlance.Authorization.LanguageEditor;
using Parlance.Authorization.Superuser;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Jobs;
using Parlance.Project;
using Parlance.RateLimiting;
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
using ServiceReference;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();
builder.Services.AddVicr123Accounts(builder.Configuration);
builder.Services.AddVersionControl(builder.Configuration);
builder.Services.AddParlanceProjects(builder.Configuration);
await builder.Services.AddCldrAsync(builder.Configuration);

builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ISuperuserService, SuperuserService>();
builder.Services.AddScoped<IRemoteCommunicationService, RemoteCommunicationService>();
builder.Services.AddScoped<IPermissionsService, PermissionsService>();
builder.Services.AddScoped<IAttributionConsentService, AttributionConsentService>();
builder.Services.AddScoped<IProjectMaintainersService, ProjectMaintainersService>();
builder.Services.AddSingleton<Terminology, TerminologyClient>();
builder.Services.AddSingleton<IProjectUpdateQueue, ProjectUpdateQueue>();

builder.Services.AddHostedService<ProjectUpdaterService>();

builder.Services.Configure<ParlanceOptions>(builder.Configuration.GetSection("Parlance"));
builder.Services.Configure<RateLimitingOptions>(builder.Configuration.GetSection("rateLimiting"));

SqliteConnection? connection = null;

builder.Services.AddDbContext<ParlanceContext>(options =>
{
    if (builder.Configuration.GetSection("Parlance").GetValue("UseInMemoryDatabase", false))
    {
        connection ??= new SqliteConnection("Data Source=:memory:");
        connection.Open();
        options.UseSqlite(connection);
    }
    else
    {
        options.UseNpgsql(builder.Configuration.GetSection("Parlance")["DatabaseConnectionString"],
            optionsBuilder => optionsBuilder.EnableRetryOnFailure());
    }
});

builder.Services.AddScoped<IAuthorizationHandler, LanguageEditorHandler>();
builder.Services.AddScoped<IAuthorizationHandler, SuperuserHandler>();

builder.Services.AddQuartz(q =>
{
    q.UseMicrosoftDependencyInjectionJobFactory();
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

    //TODO
    options.AddPolicy("ProjectManager", policy => policy.Requirements.Add(new SuperuserRequirement()));
});

builder.Services.AddResponseCompression(options => options.EnableForHttps = true);

var ratelimitingOptions = new RateLimitingOptions();
builder.Configuration.GetSection("rateLimiting").Bind(ratelimitingOptions);
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

app.Run();