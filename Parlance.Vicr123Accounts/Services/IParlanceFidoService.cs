using Fido2NetLib;
using Fido2NetLib.Objects;

namespace Parlance.Vicr123Accounts.Services;

public interface IParlanceFidoService
{
    (int, CredentialCreateOptions) PrepareCredentials(User user, AuthenticatorAttachment authenticatorAttachment);
    Task StoreCredentials(User user, int id, string name, AuthenticatorAttestationRawResponse response);
    bool HaveFidoCredentials(User user);
    (int, AssertionOptions) GetCredentials(User user);
    Task<string> GetToken(User user, int id, AuthenticatorAssertionRawResponse response);
}