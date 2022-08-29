using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.VersionControl.Ssh;

namespace Parlance.VersionControl.Services;

public class SshKeyManagementService : ISshKeyManagementService
{
    private readonly ParlanceContext _dbContext;

    public SshKeyManagementService(ParlanceContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> SshKeyIsGenerated()
    {
        return await _dbContext.SshKeys.CountAsync() > 0;
    }
    
    

    public async Task GenerateNewSshKey()
    {
        _dbContext.RemoveRange(_dbContext.SshKeys);

        var keygen = new Ed25519KeyPairGenerator();
        keygen.Init(new KeyGenerationParameters(new SecureRandom(), 255));
        var keyPair = keygen.GenerateKeyPair();
        
        var privateKey = (Ed25519PrivateKeyParameters)keyPair.Private;
        var publicKey = (Ed25519PublicKeyParameters)keyPair.Public;
        
        _dbContext.Add(new SshKey
        {
            SshKeyContents = "ssh-ed25519 " + Convert.ToBase64String(await SshWriter.EncodePublicKey(publicKey)) + " Parlance",
            SshPrivateKeyContents = "-----BEGIN OPENSSH PRIVATE KEY-----\n" + string.Concat(Convert.ToBase64String(await SshWriter.EncodePrivateKey(privateKey)).Select((c, i) => i > 0 && i % 70 == 0 ? c.ToString() : c + "\n")) + "\n-----END OPENSSH PRIVATE KEY-----"
        });

        await _dbContext.SaveChangesAsync();
    }

    public Task<string> SshPublicKey()
    {
        return Task.FromResult(_dbContext.SshKeys.Single().SshKeyContents);
    }

    public Task<string> SshPrivateKey()
    {
        return Task.FromResult(_dbContext.SshKeys.Single().SshPrivateKeyContents);
    }

    public async Task DeleteSshKey()
    {
        _dbContext.RemoveRange(_dbContext.SshKeys);
        await _dbContext.SaveChangesAsync();
    }
}