using System.Globalization;
using System.Reflection;
using System.Resources;
using Parlance.CldrData;

// ReSharper disable LocalizableElement

namespace Parlance.Notifications.Email;

public class NotificationEmail
{
    public NotificationEmail(Locale locale, string emailType, params string[] args)
    {
        var rm = new ResourceManager("EmailContents", Assembly.GetExecutingAssembly());
        var ci = new CultureInfo(locale.ToDashed());
        Body = rm.GetString($"{emailType}.Body", ci) ?? throw new ArgumentException($"Required resource {emailType}.Body does not exist", nameof(emailType));
    }
    
    public string Body { get; }
}