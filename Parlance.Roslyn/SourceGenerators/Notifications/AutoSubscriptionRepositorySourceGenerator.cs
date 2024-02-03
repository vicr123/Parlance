using System.Diagnostics;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Parlance.Roslyn.SourceGenerators.Notifications;

[Generator]
public class AutoSubscriptionRepositorySourceGenerator : ISourceGenerator
{
    public void Initialize(GeneratorInitializationContext context)
    {
        // Initialize the syntax receiver
        context.RegisterForSyntaxNotifications(() => new SyntaxReceiver());
    }

    public void Execute(GeneratorExecutionContext context)
    {
        if (context.Compilation.Assembly.Name != "Parlance.Notifications")
        {
            return;
        }
        
        // Get the received syntax
        var receiver = (SyntaxReceiver)context.SyntaxReceiver!;
        var classDeclarations = receiver.NotificationEvents;

        // Define list of pairs
        var pairs = new List<(string, string)>();

        // Populate pairs with the class name and static property value
        foreach (var classDeclaration in classDeclarations)
        {
            var staticProperty = classDeclaration.Class.DescendantNodes()
                .OfType<PropertyDeclarationSyntax>()
                .FirstOrDefault(p => p.Modifiers.Any(SyntaxKind.StaticKeyword) &&
                    p.Identifier.Text == "AutoSubscriptionEventName");

            if (staticProperty?.ExpressionBody is null)
            {
                continue;
            }
            
            var propertyValue = (staticProperty.ExpressionBody.Expression as LiteralExpressionSyntax)?.Token.ValueText;
            pairs.Add((receiver.NotificationChannels.SingleOrDefault(x => x.ClassName == classDeclaration.NotificationChannel)?.ChannelNameValue ?? "???", propertyValue ?? "???"));
        }

        // Define source
        var sourceBuilder = $$"""
                              namespace Parlance.Notifications.Generated;

                              public static class AutoSubscriptionRepository
                              {
                                  public static List<(string, string)> AutoSubscriptions = new()
                                  {
                                      {{string.Join(",\n", pairs.Select(x => $"""new("{x.Item1}", "{x.Item2}")"""))}}
                                  };
                              }
                              """;

        // Add source to compilation
        context.AddSource("AutoSubscriptionRepository", sourceBuilder);
    }

    private class SyntaxReceiver : ISyntaxReceiver
    {
        public List<AutoSubscriptionEventInfo> NotificationEvents { get; } = [];
        
        public List<NotificationChannelInfo> NotificationChannels { get; } = [];
        
        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            // Look for classes annotated with AutoSubscription
            if (syntaxNode is ClassDeclarationSyntax { AttributeLists.Count: > 0 } classDeclarationSyntax)
            {
                foreach (var attributeArgument in classDeclarationSyntax.AttributeLists
                             .SelectMany(attributeList => attributeList.Attributes,
                                 (attributeList, attribute) => new { attributeList, attribute })
                             .Where(t => t.attribute.Name.ToString() == "AutoSubscription")
                             .Select(t => t.attribute.ArgumentList?.Arguments.FirstOrDefault()?.Expression)
                             .OfType<TypeOfExpressionSyntax>())
                {
                    NotificationEvents.Add(new()
                    {
                        Class = classDeclarationSyntax,
                        NotificationChannel = attributeArgument.Type.ToString()
                    });
                }
            }
            
            // Look for classes that inherit from INotificationChannel and has ChannelName property
            if (syntaxNode is ClassDeclarationSyntax classDeclaration)
            {
                var prop = classDeclaration.Members.OfType<PropertyDeclarationSyntax>()
                    .FirstOrDefault(p => p.Identifier.Text == "ChannelName" && p.Modifiers.Any(SyntaxKind.StaticKeyword));
                var value = (prop?.ExpressionBody?.Expression as LiteralExpressionSyntax)?.Token.ValueText;
                if (value != null)
                {
                    NotificationChannels.Add(new NotificationChannelInfo
                    {
                        ClassName = classDeclaration.Identifier.Text,
                        ChannelNameValue = value
                    });
                }
            }
        }
    }

    private class AutoSubscriptionEventInfo
    {
        public required ClassDeclarationSyntax Class { get; init; }

        public required string NotificationChannel { get; init; }
    }
    
    private class NotificationChannelInfo
    {
        public required string ClassName { get; init; }
        public required string ChannelNameValue { get; init; }
    }
}