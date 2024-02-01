using System.Reflection;
using System.Text;
using AngleSharp.Text;
using Markdig;
using Mjml.Net;
using Parlance.CldrData;
using Parlance.Vicr123Accounts.Services;
using SmartFormat;

// ReSharper disable LocalizableElement

namespace Parlance.Notifications.Email;

public class NotificationEmail
{
    public NotificationEmail(User user, EmailOptions emailOptions, Locale locale, string emailType, object args)
    {
        var markdownBody = Smart.Format(GetGeneralResource("Body"), new
        {
            User = user.Username,
            Body = GetResource("Body")
        });

        var unsubscribeLink = new Uri($"{emailOptions.RootUrl}/unsubscribe").AbsoluteUri;
        
        Body = $"""
                {Smart.Format(Markdown.ToPlainText(markdownBody), args)}
                
                {GetGeneralResource("Unsubscribe1")} {Smart.Format(GetGeneralResource("Unsubscribe2Text"), new
                {
                    UnsubscribeLink = unsubscribeLink
                })}
                """;
        Subject = Smart.Format(GetResource("Subject"), args);

        var asm = Assembly.GetExecutingAssembly();
        using var mjmlTemplateStream = asm.GetManifestResourceStream(
            $"{asm.GetName().Name}.Email.Templates.mjml-email-template.mjml");
        using var mjmlTemplateReader = new StreamReader(mjmlTemplateStream!, Encoding.UTF8);
        
        var mjml = Smart.CreateDefaultSmartFormat(new()
        {
            Parser = new()
            {
                ParseInputAsHtml = true
            }
        }).Format(mjmlTemplateReader.ReadToEnd(), new
        {
            Body = Markdown.ToHtml(Smart.Format(markdownBody, args)),
            Unsubscribe1 = GetGeneralResource("Unsubscribe1"),
            Unsubscribe2 = GetGeneralResource("Unsubscribe2"),
            
            // TODO: Unsubscribe logic
            UnsubscribeLink = unsubscribeLink,
            HeadingImageSource = new Uri($"{emailOptions.RootUrl}/mail/parlance.svg").AbsoluteUri,
            FontUrl = new Uri($"{emailOptions.RootUrl}/mail/mail.css").AbsoluteUri
        }).ReplaceFirst("<style>", "<mj-style>").ReplaceFirst("</style>", "</mj-style>");
        
        var mjmlRenderer = new MjmlRenderer();
        HtmlBody = mjmlRenderer.Render(mjml, new()
        {
            Beautify = false
        }).Html;
        
        return;

        string GetResource(string resource)
        {
            return GetResourceWithType(emailType, resource);
        }

        string GetGeneralResource(string resource)
        {
            return GetResourceWithType("General", resource);
        }

        string GetResourceWithType(string type, string resource)
        {
            return Resources.EmailContents.ResourceManager.GetString($"{type}.{resource}", locale.ToCultureInfo()) ??
                   throw new ArgumentException($"Required resource {type}.{resource} does not exist",
                       nameof(type));
        }
    }
    
    public string Body { get; }
    
    public string HtmlBody { get; }
    
    public string Subject { get; set; }
}