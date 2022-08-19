using LibGit2Sharp;
using LibGit2Sharp.Handlers;

namespace Parlance.Services.RemoteCommunication;

public interface IRemoteCommunicationService
{
    public Credentials CredentialsHandler(string url, string usernameFromUrl, SupportedCredentialTypes types);
    public bool CertificateCheckHandler(Certificate certificate, bool valid, string host);
}