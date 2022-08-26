using JetBrains.Annotations;

namespace Parlance.Project.TranslationFiles;

[MeansImplicitUse]
public class TranslationFileTypeAttribute : Attribute
{
    public enum ExpectedTranslationFileNameFormat
    {
        Dashed,
        Underscored
    }
    
    public string HandlerFor { get; }
    public ExpectedTranslationFileNameFormat FileNameFormat { get; }

    public TranslationFileTypeAttribute(string handlerFor, ExpectedTranslationFileNameFormat fileNameFormat)
    {
        HandlerFor = handlerFor;
        FileNameFormat = fileNameFormat;
    }
}