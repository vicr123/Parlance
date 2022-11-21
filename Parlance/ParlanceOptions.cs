namespace Parlance;

public class ParlanceOptions
{
    private readonly string _repositoryDirectory = null!;

    public required string RepositoryDirectory
    {
        get => _repositoryDirectory;
        init => _repositoryDirectory = value.Replace("$HOME", Environment.GetFolderPath(Environment.SpecialFolder.UserProfile));
    }

    public bool UseDummyAuthenticationService { get; init; }

    public bool UseSqliteDatabase { get; init; }

    public required string DatabaseConnectionString { get; init; }
}