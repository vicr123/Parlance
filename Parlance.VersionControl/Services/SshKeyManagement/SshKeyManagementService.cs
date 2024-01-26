using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Parlance.Database;
using Parlance.Database.Models;
using Parlance.VersionControl.Ssh;

namespace Parlance.VersionControl.Services.SshKeyManagement;

public class SshKeyManagementService(ParlanceContext dbContext) : ISshKeyManagementService
{
    public async Task<bool> SshKeyIsGenerated()
    {
        return await dbContext.SshKeys.AnyAsync();
    }

    public async Task GenerateNewSshKey()
    {
        dbContext.RemoveRange(dbContext.SshKeys);

        var keygen = new Ed25519KeyPairGenerator();
        keygen.Init(new KeyGenerationParameters(new SecureRandom(), 255));
        var keyPair = keygen.GenerateKeyPair();

        var privateKey = (Ed25519PrivateKeyParameters)keyPair.Private;
        var publicKey = (Ed25519PublicKeyParameters)keyPair.Public;

        dbContext.Add(new SshKey
        {
            SshKeyContents = "ssh-ed25519 " + Convert.ToBase64String(await SshWriter.EncodePublicKey(publicKey)) +
                             " Parlance",
            SshPrivateKeyContents = "-----BEGIN OPENSSH PRIVATE KEY-----\n" +
                                    string.Concat(Convert.ToBase64String(await SshWriter.EncodePrivateKey(privateKey))
                                        .Select((c, i) => i > 0 && i % 70 == 0 ? c.ToString() : c + "\n")) +
                                    "\n-----END OPENSSH PRIVATE KEY-----"
        });

        await dbContext.SaveChangesAsync();
    }

    public Task<string> SshPublicKey()
    {
        return Task.FromResult(dbContext.SshKeys.Single().SshKeyContents);
    }

    public Task<string> SshPrivateKey()
    {
        return Task.FromResult(dbContext.SshKeys.Single().SshPrivateKeyContents);
    }

    public async Task DeleteSshKey()
    {
        dbContext.RemoveRange(dbContext.SshKeys);
        await dbContext.SaveChangesAsync();
    }
}