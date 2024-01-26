using System.Reflection;
using System.Text;
using Jint;
using Jint.Native;

namespace Parlance.Project.Checks;

public class ParlanceChecks : IParlanceChecks
{
    private readonly Engine _jsEngine;

    public ParlanceChecks()
    {
        using var checksStream =
            Assembly.GetEntryAssembly()!.GetManifestResourceStream(
                $"{Assembly.GetEntryAssembly()!.GetName().Name}.checks.js");
        using var checksReader = new StreamReader(checksStream!, Encoding.UTF8);
        var checksCode = checksReader.ReadToEnd();

        _jsEngine = new Engine();
        _jsEngine.Modules.Add("checks", checksCode);
    }

    public IEnumerable<CheckResult> CheckTranslation(string source, string translation, string checkSet)
    {
        var checksModule = _jsEngine.Modules.Import("checks");
        var checkTranslationFunction = checksModule.Get("checkTranslation").AsFunctionInstance();
        try
        {
            var result = _jsEngine.Invoke(checkTranslationFunction, new JsString(source), new JsString(translation),
                new JsString(checkSet));

            return result.AsArray().Select(val =>
            {
                var obj = val.AsObject();
                return new CheckResult
                {
                    CheckSeverity = obj.Get("checkSeverity").AsString() switch
                    {
                        "warn" => CheckResult.Severity.Warning,
                        "error" => CheckResult.Severity.Error,
                        var s => throw new ArgumentOutOfRangeException(
                            $"Invalid severity value '{s}' from checker script.")
                    },
                    Message = obj.Get("message").AsString()
                };
            });
        }
        catch (Exception)
        {
            return Enumerable.Empty<CheckResult>();
        }
    }
}