using JetBrains.Annotations;

namespace Parlance.Project.TranslationFiles;

[MeansImplicitUse]
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public class TranslationFileTypeAttribute(string handlerFor, ExpectedTranslationFileNameFormat fileNameFormat)
    : Attribute
{
    public string HandlerFor { get; } = handlerFor;
    public ExpectedTranslationFileNameFormat FileNameFormat { get; } = fileNameFormat;
}

public enum ExpectedTranslationFileNameFormat
{
    Dashed,
    Underscored
}
