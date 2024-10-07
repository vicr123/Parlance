using System.Runtime.CompilerServices;
using Tmds.DBus;

[assembly: InternalsVisibleTo(Tmds.DBus.Connection.DynamicAssemblyName)]
namespace Parlance.Vicr123Accounts.DBus
{
    [DBusInterface("com.vicr123.accounts.Manager")]
    interface IManager : IDBusObject
    {
        Task<ObjectPath> CreateUserAsync(string Username, string Password, string Email);
        Task<ObjectPath> UserByIdAsync(ulong Id);
        Task<ulong> UserIdByUsernameAsync(string Username);
        Task<string> ProvisionTokenAsync(string Username, string Password, string Application, IDictionary<string, object> ExtraOptions);
        Task<string> ForceProvisionTokenAsync(ulong UserId, string Application);
        Task<string[]> TokenProvisioningMethodsAsync(string Username, string Application);
        Task<string[]> TokenProvisioningMethodsWithPurposeAsync(string Username, string Purpose, string Application);
        Task<IDictionary<string, object>> ProvisionTokenByMethodAsync(string Method, string Username, string Application, IDictionary<string, object> ExtraOptions);
        Task<ObjectPath> UserForTokenAsync(string Token);
        Task<ObjectPath> UserForTokenWithPurposeAsync(string Token, string ExpectedTokenPurpose);
        Task<ulong[]> AllUsersAsync();
        Task<ObjectPath> CreateMailMessageAsync(string To);
    }

    [DBusInterface("com.vicr123.accounts.Fido2")]
    interface IFido2 : IDBusObject
    {
        Task<string> PrepareRegisterAsync(string Application, string Rp, int AuthenticatorAttachment);
        Task CompleteRegisterAsync(string Response, string[] ExpectOrigins, string KeyName);
        Task<(int, string, string)[]> GetKeysAsync();
        Task DeleteKeyAsync(int Id);
    }

    [DBusInterface("com.vicr123.accounts.PasswordReset")]
    interface IPasswordReset : IDBusObject
    {
        Task<(string, IDictionary<string, object>)[]> ResetMethodsAsync();
        Task ResetPasswordAsync(string Type, IDictionary<string, object> Challenge);
    }

    [DBusInterface("com.vicr123.accounts.TwoFactor")]
    interface ITwoFactor : IDBusObject
    {
        Task<string> GenerateTwoFactorKeyAsync();
        Task EnableTwoFactorAuthenticationAsync(string OtpKey);
        Task DisableTwoFactorAuthenticationAsync();
        Task RegenerateBackupKeysAsync();
        Task<IDisposable> WatchTwoFactorEnabledChangedAsync(Action<bool> handler, Action<Exception> onError = null);
        Task<IDisposable> WatchSecretKeyChangedAsync(Action<string> handler, Action<Exception> onError = null);
        Task<IDisposable> WatchBackupKeysChangedAsync(Action<(string, bool)[]> handler, Action<Exception> onError = null);
        Task<T> GetAsync<T>(string prop);
        Task<TwoFactorProperties> GetAllAsync();
        Task SetAsync(string prop, object val);
        Task<IDisposable> WatchPropertiesAsync(Action<PropertyChanges> handler);
    }

    [Dictionary]
    class TwoFactorProperties
    {
        private bool _TwoFactorEnabled = default(bool);
        public bool TwoFactorEnabled
        {
            get
            {
                return _TwoFactorEnabled;
            }

            set
            {
                _TwoFactorEnabled = (value);
            }
        }

        private string _SecretKey = default(string);
        public string SecretKey
        {
            get
            {
                return _SecretKey;
            }

            set
            {
                _SecretKey = (value);
            }
        }

        private (string, bool)[] _BackupKeys = default((string, bool)[]);
        public (string, bool)[] BackupKeys
        {
            get
            {
                return _BackupKeys;
            }

            set
            {
                _BackupKeys = (value);
            }
        }
    }

    static class TwoFactorExtensions
    {
        public static Task<bool> GetTwoFactorEnabledAsync(this ITwoFactor o) => o.GetAsync<bool>("TwoFactorEnabled");
        public static Task<string> GetSecretKeyAsync(this ITwoFactor o) => o.GetAsync<string>("SecretKey");
        public static Task<(string, bool)[]> GetBackupKeysAsync(this ITwoFactor o) => o.GetAsync<(string, bool)[]>("BackupKeys");
    }

    [DBusInterface("com.vicr123.accounts.User")]
    interface IUser : IDBusObject
    {
        Task SetUsernameAsync(string Username);
        Task SetPasswordAsync(string Password);
        Task SetEmailAsync(string Email);
        Task ResendVerificationEmailAsync();
        Task VerifyEmailAsync(string VerificationCode);
        Task<bool> VerifyPasswordAsync(string Password);
        Task ErasePasswordAsync();
        Task SetEmailVerifiedAsync(bool Verified);
        Task<ObjectPath> CreateMailMessageAsync();
        Task<IDisposable> WatchUsernameChangedAsync(Action<(string oldUsername, string newUsername)> handler, Action<Exception> onError = null);
        Task<IDisposable> WatchEmailChangedAsync(Action<string> handler, Action<Exception> onError = null);
        Task<IDisposable> WatchVerifiedChangedAsync(Action<bool> handler, Action<Exception> onError = null);
        Task<T> GetAsync<T>(string prop);
        Task<UserProperties> GetAllAsync();
        Task SetAsync(string prop, object val);
        Task<IDisposable> WatchPropertiesAsync(Action<PropertyChanges> handler);
    }

    [Dictionary]
    class UserProperties
    {
        private ulong _Id = default(ulong);
        public ulong Id
        {
            get
            {
                return _Id;
            }

            set
            {
                _Id = (value);
            }
        }

        private string _Username = default(string);
        public string Username
        {
            get
            {
                return _Username;
            }

            set
            {
                _Username = (value);
            }
        }

        private string _Email = default(string);
        public string Email
        {
            get
            {
                return _Email;
            }

            set
            {
                _Email = (value);
            }
        }

        private bool _Verified = default(bool);
        public bool Verified
        {
            get
            {
                return _Verified;
            }

            set
            {
                _Verified = (value);
            }
        }
    }

    static class UserExtensions
    {
        public static Task<ulong> GetIdAsync(this IUser o) => o.GetAsync<ulong>("Id");
        public static Task<string> GetUsernameAsync(this IUser o) => o.GetAsync<string>("Username");
        public static Task<string> GetEmailAsync(this IUser o) => o.GetAsync<string>("Email");
        public static Task<bool> GetVerifiedAsync(this IUser o) => o.GetAsync<bool>("Verified");
    }

    [DBusInterface("com.vicr123.accounts.MailMessage")]
    interface IMailMessage : IDBusObject
    {
        Task SendAsync();
        Task DiscardAsync();
        Task<T> GetAsync<T>(string prop);
        Task<MailMessageProperties> GetAllAsync();
        Task SetAsync(string prop, object val);
        Task<IDisposable> WatchPropertiesAsync(Action<PropertyChanges> handler);
    }

    [Dictionary]
    class MailMessageProperties
    {
        private string _Subject = default(string);
        public string Subject
        {
            get
            {
                return _Subject;
            }

            set
            {
                _Subject = (value);
            }
        }

        private (string, string) _From = default((string, string));
        public (string, string) From
        {
            get
            {
                return _From;
            }

            set
            {
                _From = (value);
            }
        }

        private string _TextContent = default(string);
        public string TextContent
        {
            get
            {
                return _TextContent;
            }

            set
            {
                _TextContent = (value);
            }
        }

        private string _HtmlContent = default(string);
        public string HtmlContent
        {
            get
            {
                return _HtmlContent;
            }

            set
            {
                _HtmlContent = (value);
            }
        }
    }

    static class MailMessageExtensions
    {
        public static Task<string> GetSubjectAsync(this IMailMessage o) => o.GetAsync<string>("Subject");
        public static Task<(string, string)> GetFromAsync(this IMailMessage o) => o.GetAsync<(string, string)>("From");
        public static Task<string> GetTextContentAsync(this IMailMessage o) => o.GetAsync<string>("TextContent");
        public static Task<string> GetHtmlContentAsync(this IMailMessage o) => o.GetAsync<string>("HtmlContent");
        public static Task SetSubjectAsync(this IMailMessage o, string val) => o.SetAsync("Subject", val);
        public static Task SetFromAsync(this IMailMessage o, (string, string) val) => o.SetAsync("From", val);
        public static Task SetTextContentAsync(this IMailMessage o, string val) => o.SetAsync("TextContent", val);
        public static Task SetHtmlContentAsync(this IMailMessage o, string val) => o.SetAsync("HtmlContent", val);
    }
}