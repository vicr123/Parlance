using Microsoft.AspNetCore.Authorization;
using Parlance.CldrData;
using Parlance.Database;
using Parlance.Services.Permissions;
using Parlance.Vicr123Accounts.Authentication;

namespace Parlance.Authorization.LanguageEditor;

public class LanguageEditorHandler : AuthorizationHandler<LanguageEditorRequirement>
{
    private readonly ParlanceContext _parlanceContext;
    private readonly IPermissionsService _permissionsService;

    public LanguageEditorHandler(IPermissionsService permissionsService, ParlanceContext parlanceContext)
    {
        _permissionsService = permissionsService;
        _parlanceContext = parlanceContext;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context,
        LanguageEditorRequirement requirement)
    {
        if (context.Resource is not HttpContext httpContext)
        {
            return;
        }

        var username = httpContext.User.Claims.FirstOrDefault(claim => claim.Type == Claims.Username)?.Value;
        if (username is null)
        {
            return;
        }

        var routeData = httpContext.GetRouteData();
        string? project = null;
        Locale language;
        if (routeData.Values.ContainsKey("threadId"))
        {
            try
            {
                var thread = _parlanceContext.CommentThreads
                    .Single(x => x.Id == Guid.Parse(routeData.Values["threadId"]!.ToString()!));

                project = thread.Project;
                language = Locale.FromDatabaseRepresentation(thread.Language)!;
            }
            catch (InvalidOperationException)
            {
                return;
            }
        }
        else if (routeData.Values.ContainsKey("project") && routeData.Values.ContainsKey("language"))
        {
            project = routeData.Values["project"]!.ToString()!;
            language = routeData.Values["language"]!.ToString()!.ToLocale();
        } else if (routeData.Values.ContainsKey("language"))
        {
            language = routeData.Values["language"]!.ToString()!.ToLocale();
        }
        else
        {
            return;
        }

        if (project is null)
        {
            if (await _permissionsService.HasLocalePermission(username,
                    language))
            {
                context.Succeed(requirement);
            }
        }
        else
        {
            if (await _permissionsService.CanEditProjectLocale(username, project,
                    language))
            {
                context.Succeed(requirement);
            }
        }
    }
}