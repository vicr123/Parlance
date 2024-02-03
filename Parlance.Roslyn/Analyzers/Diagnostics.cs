using Microsoft.CodeAnalysis;

// ReSharper disable InconsistentNaming

namespace Parlance.Roslyn.Analyzers;

public class Diagnostics
{
        public static readonly DiagnosticDescriptor PL0001 = new("PL1001",
            "Class inherits from IAutoSubscription but is not annotated with AutoSubscriptionAttribute",
            "Class '{0}' is missing AutoSubscriptionAttribute", "Notifications", 
            DiagnosticSeverity.Error, true);
    
}
