using Microsoft.CodeAnalysis;

namespace Parlance.Roslyn.SourceGenerators.Notifications;

[Generator]
public class ChannelSubscriptionAttributeSourceGenerator : ISourceGenerator
{
    public void Initialize(GeneratorInitializationContext context)
    {
    }

    public void Execute(GeneratorExecutionContext context)
    {
        if (context.Compilation.Assembly.Name != "Parlance.Notifications")
        {
            return;
        }

        const string sourceCode = """
                                  namespace Parlance.Notifications.Generated;
                                      
                                  [System.AttributeUsage(System.AttributeTargets.Class, AllowMultiple = false)]
                                  public class ChannelSubscriptionAttribute : System.Attribute
                                  {
                                      public ChannelSubscriptionAttribute(Type type) {
                                          
                                      }
                                  }
                                  """;
        context.AddSource("ChannelSubscriptionAttribute", sourceCode);
    }
}