using System.Reflection;
using Parlance.CLDR;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage : IParlanceSubprojectLanguage
{
    private readonly IParlanceSubproject _subproject;
    private readonly Locale _locale;

    public static List<Type> TranslationFileTypes { get; } = new();

    public ParlanceSubprojectLanguage(IParlanceSubproject subproject, Locale locale)
    {
        _subproject = subproject;
        _locale = locale;
    }

    public async Task<IParlanceTranslationFile?> CreateTranslationFile()
    {
        foreach (var type in TranslationFileTypes)
        {
            var attr = (TranslationFileTypeAttribute) type.GetCustomAttribute(typeof(TranslationFileTypeAttribute))!;
            if (attr.HandlerFor != _subproject.TranslationFileType) continue;
            
            var translationFilePath = Path.Join(_subproject.Project.VcsDirectory,
                _subproject.Path.Replace("{lang}",  attr.FileNameFormat switch
                {
                    TranslationFileTypeAttribute.ExpectedTranslationFileNameFormat.Dashed => _locale.ToDashed(),
                    TranslationFileTypeAttribute.ExpectedTranslationFileNameFormat.Underscored => _locale.ToUnderscored(),
                    _ => throw new ArgumentOutOfRangeException()
                }));
                
            var createMethod = type.GetMethod("CreateAsync");
            if (createMethod == null) continue;
            if (createMethod.ReturnParameter.ParameterType != typeof(Task<IParlanceTranslationFile>)) continue;
                
            var args = createMethod.GetParameters();
            if (args.Length == 2)
            {
                if (args[0].ParameterType != typeof(string) || args[1].ParameterType != typeof(Locale)) continue;
                return await (Task<IParlanceTranslationFile>) createMethod.Invoke(null, new object[] {
                    translationFilePath, _locale
                })!;
            }
            
            //TODO: Dual type translation files
        }

        return null;
    }
}