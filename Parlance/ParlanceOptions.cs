namespace Parlance;

public class ParlanceOptions
{
    private readonly string _repositoryDirectory = string.Empty;

    public string RepositoryDirectory
    {
        get => _repositoryDirectory;
        init => _repositoryDirectory = value.Replace("$HOME", Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));
    }

    public bool UseDummyAuthenticationService { get; init; }
}