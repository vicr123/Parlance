using LibGit2Sharp;
using Parlance.Database;
using Parlance.VersionControl.Services;

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
        //TODO: Check number of retries
        var key = _dbContext.SshKeys.First();
        
        return new SshKeyMemoryCredentials
        {
            Username = usernameFromUrl,
            PublicKey = key.SshKeyContents,
            PrivateKey = key.SshPrivateKeyContents
        };
    }

    public bool CertificateCheckHandler(Certificate certificate, bool valid, string host)
    {
        //TODO
        return true;
    }
}