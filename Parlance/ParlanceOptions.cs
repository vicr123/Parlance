namespace Parlance;

public class ParlanceOptions
{
    private readonly string _repositoryDirectory = string.Empty;

    public string RepositoryDirectory
    {
        get => _repositoryDirectory.Replace("$HOME", Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));
        init => _repositoryDirectory = value;
    }

    public bool UseDummyAuthenticationService { get; init; }
}