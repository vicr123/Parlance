using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Diagnostics;
using System.Collections.Immutable;

namespace Parlance.Roslyn.Analyzers.Notifications;

[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class AutoSubscriptionAnalyser : DiagnosticAnalyzer
{

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics =>
        ImmutableArray.Create(Diagnostics.PL0001);

    public override void Initialize(AnalysisContext context)
    {
        context.EnableConcurrentExecution();
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.RegisterSyntaxNodeAction(AnalyzeSymbol, SyntaxKind.ClassDeclaration);
    }

    private static void AnalyzeSymbol(SyntaxNodeAnalysisContext context)
    {
        var classDeclarationSyntax = (ClassDeclarationSyntax)context.Node;
      
        var isAutoSubscription = classDeclarationSyntax.BaseList?.Types.Any(x =>
            x.ToString() == "IAutoSubscription") ?? false;

        var hasAutoSubscriptionAttribute = classDeclarationSyntax.AttributeLists.Any(
            attributeList => attributeList.Attributes.Any(
                attribute => attribute.Name.ToString() == "AutoSubscription"));

        if (isAutoSubscription && !hasAutoSubscriptionAttribute)
        {
            var diagnostic = Diagnostic.Create(Diagnostics.PL0001, classDeclarationSyntax.GetLocation(), classDeclarationSyntax.Identifier.ValueText);
            context.ReportDiagnostic(diagnostic);
        }
    }
}