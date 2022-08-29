using System.Security.Cryptography;
using System.Text;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Parlance.VersionControl.Ssh;

public class SshWriter : IDisposable
{
    private readonly Stream _stream;
    private readonly bool _shouldDisposeStream;

    public SshWriter()
    {
        _stream = new MemoryStream();
        _shouldDisposeStream = true;
    }
    
    public SshWriter(Stream stream)
    {
        _stream = stream;
        _shouldDisposeStream = false;
    }

    public byte[] ToArray()
    {
        if (_stream is MemoryStream ms)
        {
            return ms.ToArray();
        }

        throw new InvalidOperationException();
    }

    public byte[] ToArray(int padding)
    {
        var unpadded = ToArray();
        var align = unpadded.Length % padding;
        if (align != 0)
        {
            var padCount = padding - align;
            var paddingArray = new byte[padCount];
            for (byte i = 1; i <= padCount; i++)
            {
                paddingArray[i - 1] = i;
            }

            return Arrays.Concatenate(unpadded, paddingArray);
        }

        return unpadded;
    }

    public async Task WriteBytesAsync(byte[] bytes)
    {
        await _stream.WriteAsync(bytes);
    }

    public async Task WriteStringAsync(string str)
    {
        await WriteStringAsync(Encoding.UTF8.GetBytes(str));
    }

    public async Task WriteStringAsync(byte[] str)
    {
        await WriteUintAsync((uint) str.Length);
        await WriteBytesAsync(str);
    }

    public async Task WriteUintAsync(uint ui)
    {
        await WriteBytesAsync(new[]
        {
            (byte)((ui >> 24) & 0xFF),
            (byte)((ui >> 16) & 0xFF),
            (byte)((ui >> 8) & 0xFF),
            (byte)(ui & 0xFF)
        });
    }

    public static async Task<byte[]> EncodePrivateKey(Ed25519PrivateKeyParameters privateKey)
    {
        var publicKey = privateKey.GeneratePublicKey();
        
        using var writer = new SshWriter();
        await writer.WriteBytesAsync(Encoding.UTF8.GetBytes("openssh-key-v1\0"));
        await writer.WriteStringAsync("none"); //Cipher Name
        await writer.WriteStringAsync("none"); //KDF Name
        await writer.WriteStringAsync(""); //KDF Options
        await writer.WriteUintAsync(1); //Number of Keys
        
        await writer.WriteStringAsync(await EncodePublicKey(publicKey));

        using var skBuilder = new SshWriter();
        var checkInt = BitConverter.ToUInt32(RandomNumberGenerator.GetBytes(4));
        await skBuilder.WriteUintAsync(checkInt);
        await skBuilder.WriteUintAsync(checkInt);
        await skBuilder.WriteStringAsync("ssh-ed25519");
        await skBuilder.WriteStringAsync(publicKey.GetEncoded());
        await skBuilder.WriteStringAsync(Arrays.Concatenate(privateKey.GetEncoded(), publicKey.GetEncoded()));
        await skBuilder.WriteStringAsync("");

        await writer.WriteStringAsync(skBuilder.ToArray(8));

        return writer.ToArray();
    }

    public static async Task<byte[]> EncodePublicKey(Ed25519PublicKeyParameters publicKey)
    {
        using var pkWriter = new SshWriter();
        await pkWriter.WriteStringAsync("ssh-ed25519");
        await pkWriter.WriteStringAsync(publicKey.GetEncoded());

        return pkWriter.ToArray();
    }

    public void Dispose()
    {
        if (!_shouldDisposeStream) return;
        _stream.Dispose();
    }
}