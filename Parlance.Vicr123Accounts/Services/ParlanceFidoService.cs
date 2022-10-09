using System.Security.Cryptography;
using System.Text;
using Fido2NetLib;
using Fido2NetLib.Objects;
using Parlance.Database;
using Parlance.Database.Models;

namespace Parlance.Vicr123Accounts.Services;

internal class ParlanceFidoService : IParlanceFidoService
{
    private static readonly Dictionary<int, CredentialCreateOptions> CachedCreationOptions = new();
    private static readonly Dictionary<int, AssertionOptions> CachedAssertionOptions = new();
    private readonly IFido2 _fido2;
    private readonly ParlanceContext _parlanceContext;
    private readonly IVicr123AccountsService _vicr123AccountsService;

    public ParlanceFidoService(IFido2 fido2, ParlanceContext parlanceContext,
        IVicr123AccountsService vicr123AccountsService)
    {
        _fido2 = fido2;
        _parlanceContext = parlanceContext;
        _vicr123AccountsService = vicr123AccountsService;
    }

    public (int, CredentialCreateOptions) PrepareCredentials(User user, AuthenticatorAttachment authenticatorAttachment)
    {
        //TODO: Include list of excluded credentials
        var options = _fido2.RequestNewCredential(new Fido2User
        {
            DisplayName = user.Username,
            Id = Encoding.UTF8.GetBytes(user.Id.ToString()),
            Name = user.Username
        }, new List<PublicKeyCredentialDescriptor>(), new AuthenticatorSelection
        {
            RequireResidentKey = true,
            UserVerification = UserVerificationRequirement.Preferred,
            AuthenticatorAttachment = authenticatorAttachment
        }, AttestationConveyancePreference.None, new AuthenticationExtensionsClientInputs
        {
            Extensions = true,
            UserVerificationMethod = true
        });

        var id = RandomNumberGenerator.GetInt32(int.MaxValue);
        CachedCreationOptions.Add(id, options);

        return (id, options);
    }

    public async Task StoreCredentials(User user, int id, string name, AuthenticatorAttestationRawResponse response)
    {
        var options = CachedCreationOptions[id];
        CachedCreationOptions.Remove(id);

        //TODO: Ensure credential is unique to this user
        var cred = await _fido2.MakeNewCredentialAsync(response, options,
            (args, cancellationToken) => Task.FromResult(true));

        //Store in database
        var key = new SecurityKey
        {
            UserId = user.Id,
            CredentialId = cred.Result!.CredentialId,
            UserHandle = cred.Result.User.Id,
            PublicKey = cred.Result!.PublicKey,
            Counter = cred.Result.Counter,
            CredType = cred.Result.CredType,
            RegistrationDate = DateTime.UtcNow,
            AaGuid = cred.Result.Aaguid,
            Name = name
        };
        _parlanceContext.SecurityKeys.Add(key);

        await _parlanceContext.SaveChangesAsync();
    }

    public bool HaveFidoCredentials(User user)
    {
        return _parlanceContext.SecurityKeys.Any(x => x.UserId == user.Id);
    }

    public (int, AssertionOptions) GetCredentials(User user)
    {
        var existingCredentials = _parlanceContext.SecurityKeys.Where(x => x.UserId == user.Id).ToList()
            .Select(x => new PublicKeyCredentialDescriptor(x.CredentialId));

        var options = _fido2.GetAssertionOptions(existingCredentials, UserVerificationRequirement.Preferred,
            new AuthenticationExtensionsClientInputs
            {
                UserVerificationMethod = true
            });

        var id = RandomNumberGenerator.GetInt32(int.MaxValue);
        CachedAssertionOptions.Add(id, options);

        return (id, options);
    }

    public async Task<string> GetToken(User user, int id, AuthenticatorAssertionRawResponse response)
    {
        var options = CachedAssertionOptions[id];

        var cred = _parlanceContext.SecurityKeys.Where(x => x.UserId == user.Id).ToList()
            .Single(x => x.CredentialId.AsSpan().SequenceEqual(response.Id));

        var result = await _fido2.MakeAssertionAsync(response, options, cred.PublicKey, cred.Counter,
            (args, cancellationToken) =>
            {
                var creds = _parlanceContext.SecurityKeys.ToList().Where(
                    x => x.UserHandle.AsSpan().SequenceEqual(args.UserHandle));
                return Task.FromResult(creds.Any(x => x.CredentialId.AsSpan().SequenceEqual(args.CredentialId)));
            });

        //Update the counter
        cred.Counter = result.Counter;
        _parlanceContext.SecurityKeys.Update(cred);

        await _parlanceContext.SaveChangesAsync();

        CachedAssertionOptions.Remove(id);

        return await _vicr123AccountsService.ForceProvisionTokenAsync(user.Id);
    }
}