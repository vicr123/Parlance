using System.Reflection;
using Parlance.CLDR;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage : IParlanceSubprojectLanguage
{
    public static List<Type> TranslationFileTypes { get; } = new();

    public ParlanceSubprojectLanguage(IParlanceSubproject subproject, Locale locale)
    {
        Subproject = subproject;
        Locale = locale;
    }

    public IParlanceSubproject Subproject { get; }
    public Locale Locale { get; }

    public async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService)
    {
        foreach (var type in TranslationFileTypes)
        {
            var attr = (TranslationFileTypeAttribute) type.GetCustomAttribute(typeof(TranslationFileTypeAttribute))!;
            if (attr.HandlerFor != Subproject.TranslationFileType) continue;
            
            var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
                Subproject.Path.Replace("{lang}",  attr.FileNameFormat switch
                {
                    ExpectedTranslationFileNameFormat.Dashed => Locale.ToDashed(),
                    ExpectedTranslationFileNameFormat.Underscored => Locale.ToUnderscored(),
                    _ => throw new ArgumentOutOfRangeException()
                }));

            if (type.GetInterface(nameof(IParlanceDualTranslationFile)) is not null)
            {
                var createMethod = type.GetMethod("CreateAsync");
                return await (Task<ParlanceTranslationFile>) createMethod!.Invoke(null, new object?[] {
                    translationFilePath, Locale, this, indexingService
                })!;
            }
            else
            {
                throw new InvalidOperationException();
            }
            
            //TODO: Dual type translation files
        }

        return null;
    }
}