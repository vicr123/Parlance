using Parlance.CldrData;
// ReSharper disable StringLiteralTypo

namespace Parlance.Project.TranslationFiles.Gettext;

public class GettextPluralForms
{
    private static readonly Dictionary<string, string> DistinctPluralMapping = new() {
        { "vi", "nplurals=1; plural=0;" }, // No plurals
        { "en", "nplurals=2; plural=n != 1;" }, // Two forms
        { "fr", "nplurals=2; plural=n>1;" }, // Two forms; 0 is singular
        { "lv", "nplurals=3; nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n != 0 ? 1 : 2;" }, // Three forms: 0, ..1, other
        { "ga", "nplurals=3; plural=n==1 ? 0 : n==2 ? 1 : 2;" }, // Three forms: 1, 2, other
        { "ro", "nplurals=3; plural=n==1 ? 0 : (n==0 || (n%100 > 0 && n%100 < 20)) ? 1 : 2;" }, // Three forms: 1, ..0 | [2-9][0-9], other
        { "lt", "nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n%10>=2 && (n%100<10 || n%100>=20) ? 1 : 2;" }, // Three forms: ..1, 1[2-9], other
        { "ru", "nplurals=3; plural=n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;" }, // Three forms: 1[1-4], ..[1-4], other
        { "cs", "nplurals=3; plural=(n==1) ? 0 : (n>=2 && n<=4) ? 1 : 2;"}, // Three forms: 1, [2-4], other
        { "pl", "nplurals=3; plural=n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2;" }, // Three forms: the other one
        { "sl", "nplurals=4; plural=n%100==1 ? 0 : n%100==2 ? 1 : n%100==3 || n%100==4 ? 2 : 3;" }, // Four forms: 1, ..02, ..0[3-4], other
        { "ar", "nplurals=6; plural=n==0 ? 0 : n==1 ? 1 : n==2 ? 2 : n%100>=3 && n%100<=10 ? 3 : n%100>=11 ? 4 : 5;" } // Six forms: Arabic deluxe
    };
    
    public static string PluralFormsHeader(Locale locale)
    {
        var pluralRules = locale.PluralRules();
        return DistinctPluralMapping
                   .FirstOrDefault(plural => plural.Key.ToLocale().PluralRules().SequenceEqual(pluralRules)).Value ??
               "nplurals=1; plural=0;";
    }
}
