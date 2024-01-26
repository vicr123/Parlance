using System.Reflection;
using Parlance.CldrData;
using Parlance.Project.Index;
using Parlance.Project.TranslationFiles;

namespace Parlance.Project;

public class ParlanceSubprojectLanguage(IParlanceSubproject subproject, Locale locale) : IParlanceSubprojectLanguage
{
    public static List<Type> TranslationFileTypes { get; } = FindTranslationTypes();

    public IParlanceSubproject Subproject { get; } = subproject;
    public Locale Locale { get; } = locale;

    bool IParlanceSubprojectLanguage.Exists => File.Exists(ResolvedTranslationFilePath());

    private string ResolvedLocale()
    {
        var (_, attr) = ValidTypes().First();

        var localePart = attr.FileNameFormat switch
        {
            ExpectedTranslationFileNameFormat.Dashed => Locale.ToDashed(),
            ExpectedTranslationFileNameFormat.Underscored => Locale.ToUnderscored(),
            _ => throw new ArgumentOutOfRangeException(
                $"Invalid value for FileNameFormat for attribute '{attr}'.")
        };

        if (!File.Exists(Path.Join(Subproject.Project.VcsDirectory,
                Subproject.Path.Replace("{lang}", localePart))))
        {
            if (File.Exists(Path.Join(Subproject.Project.VcsDirectory,
                    Subproject.Path.Replace("{lang}", localePart.ToLowerInvariant()))))
            {
                return localePart.ToLowerInvariant();
            }
        }

        return localePart;
    }

    private string ResolvedTranslationFilePath() => Path.Join(Subproject.Project.VcsDirectory,
            Subproject.Path.Replace("{lang}", ResolvedLocale()));

    public async Task WriteNewTranslationFile(IParlanceIndexingService? indexingService)
    {
        await using var baseFile =
            await CreateTranslationFile(indexingService, Subproject.BaseLang, Subproject.BasePath);
        if (baseFile is null) throw new InvalidOperationException();

        var (_, attr) = ValidTypes().First();
        var translationFilePath = Path.Join(Subproject.Project.VcsDirectory,
            Subproject.Path.Replace("{lang}", ResolvedLocale()));
        await baseFile.UseAsBaseFor(translationFilePath, Locale);
    }

    public async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService)
    {
        return await CreateTranslationFile(indexingService, Locale);
    }

    private async Task<ParlanceTranslationFile?> CreateTranslationFile(IParlanceIndexingService? indexingService,
        Locale locale)
    {
        return await CreateTranslationFile(indexingService, locale, ResolvedTranslationFilePath());
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
            .SelectMany(type => type.GetCustomAttributes<TranslationFileTypeAttribute>().Select(attr => new
            {
                type, attr
            }))
            .Where(t => t.attr.HandlerFor == Subproject.TranslationFileType)
            .Select(t => (t.type, t.attr));
    }
}