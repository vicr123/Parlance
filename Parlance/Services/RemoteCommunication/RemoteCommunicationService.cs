using LibGit2Sharp;
using Parlance.Database;

namespace Parlance.Services.RemoteCommunication;

public class RemoteCommunicationService : IRemoteCommunicationService
{
    private readonly ParlanceContext _dbContext;

    public RemoteCommunicationService(ParlanceContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Credentials CredentialsHandler(string url, string usernameFromUrl, SupportedCredentialTypes types)
    {
        //TODO
        return new SshKeyMemoryCredentials
        {
            Username = usernameFromUrl,
            PublicKey = File.ReadAllText("/home/victor/.ssh/id_rsa.pub"),
            PrivateKey = File.ReadAllText("/home/victor/.ssh/id_rsa")
        };
    }

    public bool CertificateCheckHandler(Certificate certificate, bool valid, string host)
    {
        //TODO
        return true;
    }
}