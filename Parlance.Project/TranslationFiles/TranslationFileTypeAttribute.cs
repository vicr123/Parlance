using JetBrains.Annotations;

namespace Parlance.Project.TranslationFiles;

[MeansImplicitUse]
[AttributeUsage(AttributeTargets.Class)]
public class TranslationFileTypeAttribute : Attribute
{
    public string HandlerFor { get; }
    public ExpectedTranslationFileNameFormat FileNameFormat { get; }

    public TranslationFileTypeAttribute(string handlerFor, ExpectedTranslationFileNameFormat fileNameFormat)
    {
        HandlerFor = handlerFor;
        FileNameFormat = fileNameFormat;
    }
}

public enum ExpectedTranslationFileNameFormat
{
    Dashed,
    Underscored
}
