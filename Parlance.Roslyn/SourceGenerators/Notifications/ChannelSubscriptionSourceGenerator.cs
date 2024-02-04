using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Parlance.Roslyn.SourceGenerators.Notifications;

[Generator]
public class ChannelSubscriptionSourceGenerator : ISourceGenerator
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
        var classDeclarations = receiver.NotificationChannelSubscriptions;

        // Define list of pairs
        var pairs = new List<(string, string)>();

        // Populate pairs with the class name and static property value
        foreach (var classDeclaration in classDeclarations)
        {
            var semanticModel = context.Compilation.GetSemanticModel(classDeclaration.Class.SyntaxTree);
                
            var channel =
                receiver.NotificationChannels.SingleOrDefault(x => x.ClassName == classDeclaration.NotificationChannel)?.ChannelNameValue ?? "???";
            var @class = semanticModel.GetDeclaredSymbol(classDeclaration.Class)!;
            pairs.Add((channel, @class.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat)));
        }


        // Define source
        var sourceBuilder = $$"""
                              using Parlance.Notifications.Channels;
                              using Parlance.Database.Models;
                              
                              namespace Parlance.Notifications.Generated;

                              public static class ChannelSubscriptionRepository
                              {
                                  public static INotificationChannelSubscriptionBase FromDatabase(NotificationSubscription subscription)
                                  {
                                      return subscription.Channel switch {
                                          {{string.Join("\n", pairs.Select(x => $"\"{x.Item1}\" => {x.Item2}.FromDatabase(subscription),"))}}
                                          _ => throw new ArgumentException()
                                      };
                                  }
                              }
                              """;

        // Add source to compilation
        context.AddSource("ChannelSubscriptionRepository", sourceBuilder);
    }

    private class SyntaxReceiver : ISyntaxReceiver
    {
        public List<ChannelSubscriptionEventInfo> NotificationChannelSubscriptions { get; } = [];
        
        public List<NotificationChannelInfo> NotificationChannels { get; } = [];
        
        public void OnVisitSyntaxNode(SyntaxNode syntaxNode)
        {
            // Look for classes annotated with AutoSubscription
            if (syntaxNode is ClassDeclarationSyntax { AttributeLists.Count: > 0 } classDeclarationSyntax)
            {
                foreach (var attributeArgument in classDeclarationSyntax.AttributeLists
                             .SelectMany(attributeList => attributeList.Attributes,
                                 (attributeList, attribute) => new { attributeList, attribute })
                             .Where(t => t.attribute.Name.ToString() == "ChannelSubscription")
                             .Select(t => t.attribute.ArgumentList?.Arguments.FirstOrDefault()?.Expression)
                             .OfType<TypeOfExpressionSyntax>())
                {
                    NotificationChannelSubscriptions.Add(new()
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

    private class ChannelSubscriptionEventInfo
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