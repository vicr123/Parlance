using System.Reflection;
using System.Text;
using Jint;
using Jint.Native;

namespace Parlance.Project.Checks;

public class ParlanceChecks : IParlanceChecks
{
    private readonly Engine jsEngine;
    
    public ParlanceChecks()
    {
        using var checksStream = Assembly.GetEntryAssembly()!.GetManifestResourceStream($"{Assembly.GetEntryAssembly()!.GetName().Name}.ClientApp.src.checks.js");
        using var checksReader = new StreamReader(checksStream!, Encoding.UTF8);
        var checksCode = checksReader.ReadToEnd();

        jsEngine = new Engine(options =>
        {
            
        });
        jsEngine.AddModule("checks", checksCode);
    }

    public IEnumerable<CheckResult> CheckTranslation(string source, string translation, string checkSet)
    {
        var engine = new Engine()
            .SetValue("log", new Action<object>(Console.WriteLine));
    
            engine.Execute(@"
                function hello() {
                    let string = `one two three`;
                    let matches = [...string.matchAll(/t/g)];
                    log(matches.length);
                };
             
                hello();
            ");
        
        var checksModule = jsEngine.ImportModule("checks");
        var checkTranslationFunction = checksModule.Get("checkTranslation").AsFunctionInstance();
        var result = jsEngine.Invoke(checkTranslationFunction, new JsString(source), new JsString(translation), new JsString(checkSet));

        return result.AsArray().Select(val =>
        {
            var obj = val.AsObject();
            return new CheckResult
            {
                CheckSeverity = obj.Get("checkSeverity").AsString() switch
                {
                    "warn" => CheckResult.Severity.Warning,
                    "error" => CheckResult.Severity.Error,
                    _ => throw new ArgumentOutOfRangeException()
                },
                Message = obj.Get("message").AsString()
            };
        });
    }
}