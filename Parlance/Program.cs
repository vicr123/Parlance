using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Parlance;
using Parlance.Authorization.HasToken;
using Parlance.Authorization.LanguageEditor;
using Parlance.Database;
using Parlance.Projects;
using Parlance.VersionControl.Services;
using Parlance.Vicr123Accounts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllersWithViews();
builder.Services.AddSwaggerGen();
builder.Services.AddVicr123Accounts(builder.Configuration);

builder.Services.AddSingleton<IVersionControlService, VersionControlService>();
builder.Services.AddSingleton<IProjectService, ProjectService>();
builder.Services.AddSingleton<IAuthorizationHandler, LanguageEditorHandler>();
builder.Services.AddSingleton<IAuthorizationHandler, HasTokenHandler>();

builder.Services.Configure<ParlanceOptions>(builder.Configuration.GetSection("Parlance"));

builder.Services.AddDbContext<ParlanceContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetSection("Parlance")["DatabaseConnectionString"]);
});

builder.Services.AddAuthorizationCore(options =>
{
    options.AddPolicy("HasToken", policy => policy.Requirements.Add(new HasTokenRequirement()));
    options.AddPolicy("LanguageEditor", policy => policy.Requirements.Add(new LanguageEditorRequirement()));
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
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    "default",
    "{controller}/{action=Index}/{id?}");

app.MapFallbackToFile("index.html");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await services.GetRequiredService<ParlanceContext>().Initialize();
}

app.Run();