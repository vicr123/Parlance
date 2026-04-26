using Microsoft.AspNetCore.SignalR;
using Parlance.CldrData;

namespace Parlance.Hubs;

public class TranslatorHub : Hub<ITranslatorClient>
{
    public async Task<String> Subscribe(string project, string subproject, string language)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroup(project, subproject, language.ToLocale()));

        return "Subscribed";
    }
    
    public async Task<String> Unsubscribe(string project, string subproject, string language)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroup(project, subproject, language.ToLocale()));

        return "Unsubscribed";
    }

    public static string GetGroup(string project, string subproject, Locale language) => $"{project}.${subproject}.${language.ToDashed()}";
}