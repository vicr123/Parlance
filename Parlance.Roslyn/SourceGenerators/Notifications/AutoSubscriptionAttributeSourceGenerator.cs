using Microsoft.CodeAnalysis;

namespace Parlance.Roslyn.SourceGenerators.Notifications;

[Generator]
public class AutoSubscriptionAttributeSourceGenerator : ISourceGenerator
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
                                  public class AutoSubscriptionAttribute : System.Attribute
                                  {
                                      public AutoSubscriptionAttribute(Type type) {
                                          
                                      }
                                  }
                                  """;
        context.AddSource("AutoSubscriptionAttribute", sourceCode);
    }
}