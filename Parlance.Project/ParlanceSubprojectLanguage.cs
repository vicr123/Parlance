using System.Reflection;
using Parlance.CldrData;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage : IParlanceSubprojectLanguage
{
    public ParlanceSubprojectLanguage(IParlanceSubproject subproject, Locale locale)
    {
        Subproject = subproject;
        Locale = locale;
    }

    public static List<Type> TranslationFileTypes { get; } = FindTranslationTypes();

    public IParlanceSubproject Subproject { get; }
    public Locale Locale { get; }

    bool IParlanceSubprojectLanguage.Exists
    {
        get
        {
            var (_, attr) = ValidTypes().First();

            var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
                Subproject.Path.Replace("{lang}", attr.FileNameFormat switch
                {
                    ExpectedTranslationFileNameFormat.Dashed => Locale.ToDashed(),
                    ExpectedTranslationFileNameFormat.Underscored => Locale.ToUnderscored(),
                    _ => throw new ArgumentOutOfRangeException(
                        $"Invalid value for FileNameFormat for attribute '{attr}'.")
                }));

            return File.Exists(translationFilePath);
        }
    }

    public async Task WriteNewTranslationFile(IParlanceIndexingService? indexingService)
    {
        await using var baseFile = await CreateTranslationFile(indexingService, Subproject.BaseLang);
        if (baseFile is null) throw new InvalidOperationException();

        var (_, attr) = ValidTypes().First();
        var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
            Subproject.Path.Replace("{lang}", attr.FileNameFormat switch
            {
                ExpectedTranslationFileNameFormat.Dashed => Locale.ToDashed(),
                ExpectedTranslationFileNameFormat.Underscored => Locale.ToUnderscored(),
                _ => throw new ArgumentOutOfRangeException(
                    $"Invalid value for FileNameFormat for attribute '{attr}'.")
            }));
        await baseFile.UseAsBaseFor(translationFilePath, Locale);
    }

    public async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService)
    {
        return await CreateTranslationFile(indexingService, Locale);
    }

    private async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService,
        Locale locale)
    {
        try
        {
            var (type, attr) = ValidTypes().First();

            var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
                Subproject.Path.Replace("{lang}", attr.FileNameFormat switch
                {
                    ExpectedTranslationFileNameFormat.Dashed => locale.ToDashed(),
                    ExpectedTranslationFileNameFormat.Underscored => locale.ToUnderscored(),
                    _ => throw new ArgumentOutOfRangeException(
                        $"Invalid value for FileNameFormat for attribute '{attr}'.")
                }));

            if (type.GetInterface(nameof(IParlanceDualTranslationFile)) is not null)
            {
                var createMethod = type.GetMethod("CreateAsync");
                return await (Task<ParlanceTranslationFile>)createMethod!.Invoke(null, new object?[]
                {
                    translationFilePath, locale, this, indexingService
                })!;
            }

            if (type.GetInterface(nameof(IParlanceMonoTranslationFile)) is not null)
            {
                var baseFilePath = Path.Join(Subproject.Project.VcsDirectory,
                    Subproject.Path.Replace("{lang}", attr.FileNameFormat switch
                    {
                        ExpectedTranslationFileNameFormat.Dashed => Subproject.BaseLang.ToDashed(),
                        ExpectedTranslationFileNameFormat.Underscored => Subproject.BaseLang.ToUnderscored(),
                        _ => throw new ArgumentOutOfRangeException(
                            $"Invalid value for FileNameFormat for attribute '{attr}'.")
                    }));

                var createMethod = type.GetMethod("CreateAsync");
                return await (Task<ParlanceTranslationFile>)createMethod!.Invoke(null, new object?[]
                {
                    translationFilePath, locale, baseFilePath, Subproject.BaseLang, this, indexingService
                })!;
            }

            return null;
        }
        catch (InvalidOperationException)
        {
            return null;
        }
    }

    private static List<Type> FindTranslationTypes()
    {
        return typeof(ParlanceProjectExtensions).Assembly.GetTypes()
            .Where(t => t.IsDefined(typeof(TranslationFileTypeAttribute))).ToList();
    }

    private IEnumerable<(Type, TranslationFileTypeAttribute)> ValidTypes()
    {
        foreach (var type in TranslationFileTypes)
        {
            var attr = (TranslationFileTypeAttribute)type.GetCustomAttribute(typeof(TranslationFileTypeAttribute))!;
            if (attr.HandlerFor == Subproject.TranslationFileType) yield return (type, attr);
        }
    }
}