namespace Parlance.VersionControl.Services.SshKeyManagement;

public interface ISshKeyManagementService
{
    public Task<bool> SshKeyIsGenerated();
    public Task GenerateNewSshKey();
    public Task<string> SshPublicKey();
    public Task<string> SshPrivateKey();
    public Task DeleteSshKey();
}