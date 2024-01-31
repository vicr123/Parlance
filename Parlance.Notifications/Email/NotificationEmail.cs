using System.Globalization;
using System.Reflection;
using System.Resources;
using Parlance.CldrData;
using SmartFormat;

// ReSharper disable LocalizableElement

namespace Parlance.Notifications.Email;

public class NotificationEmail
{
    public NotificationEmail(Locale locale, string emailType, object args)
    {
        Body = Smart.Format(GetResource("Body"), args);
        Subject = Smart.Format(GetResource("Subject"), args);
        return;

        string GetResource(string resource)
        {
            return Resources.EmailContents.ResourceManager.GetString($"{emailType}.{resource}", locale.ToCultureInfo()) ??
                   throw new ArgumentException($"Required resource {emailType}.{resource} does not exist",
                       nameof(emailType));
        }
    }
    
    public string Body { get; }
    
    public string Subject { get; set; }
}