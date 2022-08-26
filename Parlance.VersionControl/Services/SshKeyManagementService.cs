using Microsoft.EntityFrameworkCore;
using Parlance.Database;
using Parlance.Database.Models;

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

        const int keyBits = 2048;

        using var keygen = new SshKeyGenerator.SshKeyGenerator(keyBits);
        _dbContext.Add(new SshKey
        {
            SshKeyContents = keygen.ToRfcPublicKey("Parlance"),
            SshPrivateKeyContents = keygen.ToPrivateKey()
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