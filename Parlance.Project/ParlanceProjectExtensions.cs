namespace Parlance.Project;

public static class ParlanceProjectExtensions
{
    public static IParlanceProject GetParlanceProject(this Database.Models.Project project)
    {
        return new ParlanceProject(project);
    }

    public static Locale ToLocale(this string localeIdentifier)
    {
        if (localeIdentifier.Contains("-"))
        {
            var parts = localeIdentifier.Split("-");
            return new Locale(parts[0], parts[1]);
        }

        if (localeIdentifier.Contains("_"))
        {
            var parts = localeIdentifier.Split("_");
            return new Locale(parts[0], parts[1]);
        }

        return new Locale(localeIdentifier, null);
    }
}