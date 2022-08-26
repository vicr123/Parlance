using LibGit2Sharp;

namespace Parlance.Services.RemoteCommunication;

public interface IRemoteCommunicationService
{
    public Credentials CredentialsHandler(string url, string usernameFromUrl, SupportedCredentialTypes types);
    public bool CertificateCheckHandler(Certificate certificate, bool valid, string host);
}