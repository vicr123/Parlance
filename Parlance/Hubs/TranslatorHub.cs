using Microsoft.AspNetCore.SignalR;
using Parlance.CldrData;

namespace Parlance.Hubs;

public class TranslatorHub : Hub<ITranslatorClient>
{
    public async Task Subscribe(string project, string subproject, string language)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroup(project, subproject, language.ToLocale()));
    }

    public static string GetGroup(string project, string subproject, Locale language) => $"{project}.${subproject}.${language.ToDashed()}";
}