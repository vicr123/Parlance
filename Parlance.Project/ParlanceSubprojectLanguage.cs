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
        await using var baseFile =
            await CreateTranslationFile(indexingService, Subproject.BaseLang, Subproject.BasePath);
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
        var (_, attr) = ValidTypes().First();

        var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
            Subproject.Path.Replace("{lang}", attr.FileNameFormat switch
            {
                ExpectedTranslationFileNameFormat.Dashed => locale.ToDashed(),
                ExpectedTranslationFileNameFormat.Underscored => locale.ToUnderscored(),
                _ => throw new ArgumentOutOfRangeException(
                    $"Invalid value for FileNameFormat for attribute '{attr}'.")
            }));

        return await CreateTranslationFile(indexingService, locale, translationFilePath);
    }

    private async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService,
        Locale locale, string translationFilePath)
    {
        try
        {
            var (type, _) = ValidTypes().First();

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
                var createMethod = type.GetMethod("CreateAsync");
                return await (Task<ParlanceTranslationFile>)createMethod!.Invoke(null, new object?[]
                {
                    translationFilePath, locale, Subproject.BasePath, Subproject.BaseLang, this, indexingService
                })!;
            }

            return null;
        }
        catch (DirectoryNotFoundException)
        {
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
        return TranslationFileTypes
            .Select(type => new
            {
                type,
                attr = (TranslationFileTypeAttribute)type.GetCustomAttribute(typeof(TranslationFileTypeAttribute))!
            })
            .Where(t => t.attr.HandlerFor == Subproject.TranslationFileType)
            .Select(t => (t.type, t.attr));
    }
}