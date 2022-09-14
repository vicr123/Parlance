using System.Globalization;
using System.IO.Compression;
using System.Text;
using LibGit2Sharp;
using Microsoft.AspNetCore.Mvc;
using Parlance.Helpers;
using Parlance.Project;
using Parlance.Services.Projects;
using Parlance.VersionControl.Services.VersionControl;

namespace Parlance.Controllers;

[ApiController]
[Route("git/{project}")]
public class ProjectVcsGitSmartHttpController : Controller
{
    private readonly IProjectService _projectService;
    private readonly IVersionControlService _versionControlService;

    public ProjectVcsGitSmartHttpController(IProjectService projectService,
        IVersionControlService versionControlService)
    {
        _projectService = projectService;
        _versionControlService = versionControlService;
    }

    private static async Task WritePktFlush(Stream stream)
    {
        await stream.WriteAsync(Encoding.UTF8.GetBytes("0000"));
    }

    private static async Task WritePktLine(Stream stream, byte[] pktLine)
    {
        var len = pktLine.Length + 4;
        await stream.WriteAsync(Encoding.UTF8.GetBytes(len.ToString("x4")));
        await stream.WriteAsync(pktLine);
    }

    private static async Task WritePktLine(Stream stream, string pktLine)
    {
        await WritePktLine(stream, Encoding.UTF8.GetBytes(pktLine));
    }

    private static async Task WritePktLines(Stream stream, IEnumerable<string> pktLines)
    {
        foreach (var line in pktLines) await WritePktLine(stream, line);
    }

    private async Task<Packet> GetPktLine(Stream stream)
    {
        var len = new byte[4];
        var lenLen = await stream.ReadAsync(len, 0, 4);
        if (lenLen != 4) throw new InvalidDataException();

        var lenInt = int.Parse(Encoding.UTF8.GetString(len), NumberStyles.HexNumber);
        switch (lenInt)
        {
            case 0:
                return new Packet
                {
                    IsFlush = true
                };
            case 1:
                return new Packet
                {
                    IsDelimeter = true
                };
        }

        lenInt -= 4;

        var data = new byte[lenInt];
        var dataLen = await stream.ReadAsync(data, 0, lenInt);
        if (dataLen != lenInt) throw new InvalidDataException();

        return new Packet
        {
            Data = data
        };
    }

    private static async Task WriteRef(Stream stream, Reference reference, bool symref)
    {
        using var refStream = new MemoryStream();
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(reference.ResolveToDirectReference().TargetIdentifier));
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(" "));
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(reference.CanonicalName));

        if (reference is SymbolicReference sym && symref)
            await refStream.WriteAsync(Encoding.UTF8.GetBytes($" symref-target:{sym.Target.CanonicalName}"));
        await refStream.WriteAsync(Encoding.UTF8.GetBytes("\n"));
        await WritePktLine(stream, refStream.ToArray());
    }

    private static async Task WriteSideband(Stream stream, byte channel, string text)
    {
        await WriteSideband(stream, channel, Encoding.UTF8.GetBytes($"{text}\n"));
    }

    private static async Task WriteSideband(Stream stream, byte channel, byte[] data)
    {
        using var ms = new MemoryStream(data);
        const int packetSize = 8192;
        while (ms.CanRead)
        {
            var buffer = new byte[packetSize];
            var bytesRead = await ms.ReadAsync(buffer, 0, packetSize);
            if (bytesRead == 0) return;

            await WriteSidebandPacket(stream, channel, buffer[..bytesRead]);
        }
    }

    private static async Task WriteSidebandPacket(Stream stream, byte channel, byte[] data)
    {
        using var sidebandStream = new MemoryStream();
        await sidebandStream.WriteAsync(new[] { channel });
        await sidebandStream.WriteAsync(data);
        await WritePktLine(stream, sidebandStream.ToArray());
    }

    [HttpGet]
    [Route("info/refs")]
    public async Task<IActionResult> GitHttpGetRefs(string project, [FromQuery] string? service = null)
    {
        //Only allow git-upload-pack
        if (service is not "git-upload-pack") return Forbid();

        if (_versionControlService is not GitVersionControlService gitService) return NotFound();

        if (!Request.Headers.TryGetValue("Git-Protocol", out var proto)) return BadRequest();
        if (!proto.Contains("version=2")) return BadRequest();

        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            var stream = new MemoryStream();
            using var repo = gitService.ProjectRepository(proj);

            await WritePktLine(stream, "version 2\n");
            await WritePktLine(stream, "agent=parlance/1\n");
            await WritePktLine(stream, "object-format=sha1\n");
            await WritePktLine(stream, "ls-refs\n");
            await WritePktLine(stream, "fetch\n");
            await WritePktFlush(stream);

            stream.Seek(0, SeekOrigin.Begin);
            return new FileStreamResult(stream, "application/x-git-upload-pack-advertisement");
        }
        catch (LibGit2SharpException ex)
        {
            return this.ClientError(ParlanceClientError.GitError, ex.Message);
        }
        catch (ProjectNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost]
    [Route("git-upload-pack")]
    public async Task<IActionResult> GitUploadPack(string project)
    {
        if (_versionControlService is not GitVersionControlService gitService) return NotFound();

        if (Request.Headers["Content-Encoding"].Contains("gzip"))
        {
            var oldStream = Request.Body;
            Request.Body = new GZipStream(oldStream, CompressionMode.Decompress);
        }

        Request.EnableBuffering();

        var data = new byte[8192];
        await Request.Body.ReadAsync(data);
        Request.Body.Seek(0, SeekOrigin.Begin);
        var dataString = Encoding.UTF8.GetString(data);

        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            using var repo = gitService.ProjectRepository(proj);

            var commandLineBytes = await GetPktLine(Request.Body);
            if (commandLineBytes.IsFlush) return NoContent();

            var commandLine = Encoding.UTF8.GetString(commandLineBytes.Data).Trim();
            if (!commandLine.StartsWith("command=")) return BadRequest();

            Packet pktLine;
            var capabilities = new Dictionary<string, string>();
            while (!(pktLine = await GetPktLine(Request.Body)).IsDelimeter)
            {
                var lineParts = Encoding.UTF8.GetString(pktLine.Data);
                var delim = lineParts.IndexOf('=');
                if (delim == -1)
                    capabilities.Add(lineParts, "");
                else
                    capabilities.Add(lineParts[..delim], lineParts[(delim + 1)..]);
            }

            var args = new List<byte[]>();
            while (!(pktLine = await GetPktLine(Request.Body)).IsFlush) args.Add(pktLine.Data);

            return commandLine[8..] switch
            {
                "ls-refs" => await GitUploadPackLsRefs(capabilities, args, repo),
                "fetch" => await GitUploadPackFetch(capabilities, args, repo),
                _ => BadRequest()
            };
        }
        catch (InvalidDataException)
        {
            return BadRequest();
        }
    }

    private async Task<IActionResult> GitUploadPackLsRefs(IDictionary<string, string> capabilities,
        IEnumerable<byte[]> args,
        IRepository repo)
    {
        var symrefs = false;
        foreach (var arg in args)
        {
            var argStr = Encoding.UTF8.GetString(arg).Trim();
            if (argStr == "symrefs") symrefs = true;
        }

        var stream = new MemoryStream();

        await WriteRef(stream, repo.Head.Reference, symrefs);
        foreach (var reference in repo.Refs.Where(reference => reference.IsLocalBranch))
            await WriteRef(stream, reference, symrefs);
        await WritePktFlush(stream);

        stream.Seek(0, SeekOrigin.Begin);
        return new FileStreamResult(stream, "application/x-git-upload-pack-result");
    }

    private async Task<IActionResult> GitUploadPackFetch(IDictionary<string, string> capabilities,
        IEnumerable<byte[]> args,
        IRepository repo)
    {
        var thinPack = false;
        var noprogress = false;
        var ofsdelta = false;
        var done = false;
        var want = new Queue<string>();
        var have = new List<string>();
        foreach (var arg in args)
        {
            var argStr = Encoding.UTF8.GetString(arg).Trim();
            if (argStr == "thin-pack") thinPack = true;
            if (argStr == "no-progress") noprogress = true;
            if (argStr == "ofs-delta") ofsdelta = true;
            if (argStr == "done") done = true;
            if (argStr.StartsWith("want ")) want.Enqueue(argStr[5..]);
            if (argStr.StartsWith("have ")) have.Add(argStr[5..]);
        }

        //Error?
        if (have.Count != 0 && !done)
        {
            await WritePktLine(Response.Body, "acknowledgments\n");
            var acks = have.Where(haveObject => repo.Lookup(haveObject) is not null).ToList();
            if (acks.Count == 0)
                await WritePktLine(Response.Body, "NAK\n");
            else
                await WritePktLines(Response.Body, acks.Select(ack => $"ACK {ack}\n"));
            await WritePktFlush(Response.Body);
            return new EmptyResult();
        }

        await WritePktLine(Response.Body, "packfile\n");
        await WriteSideband(Response.Body, 2, "Parlance");

        var objects = new List<string>();
        while (want.Count != 0)
        {
            var wantedObject = want.Dequeue();
            if (have.Contains(wantedObject)) continue; //Client already has this object so don't add it to the packfile

            objects.Add(wantedObject);
            var obj = repo.Lookup(wantedObject);
            if (obj is null)
            {
                await WriteSideband(Response.Body, 3, $"ERROR: could not resolve object {wantedObject}");
                return new EmptyResult();
            }

            var commit = obj.Peel<Commit>();
            if (commit is null) continue;

            foreach (var parent in commit.Parents)
                want.Enqueue(parent.Id.Sha);
        }

        var tempPath = Path.GetRandomFileName();
        Directory.CreateDirectory(tempPath);

        try
        {
            var packBuilderResults = repo.ObjectDatabase.Pack(new PackBuilderOptions(tempPath), packBuilder =>
            {
                foreach (var obj in objects.Distinct()) packBuilder.AddRecursively(new ObjectId(obj));
            });

            await WriteSideband(Response.Body, 2, $"{packBuilderResults.WrittenObjectsCount} objects...");

            var indexFile = Directory.EnumerateFiles(tempPath, "*.idx").Single();
            var indexFileContents = await System.IO.File.ReadAllBytesAsync(indexFile);

            var file = Directory.EnumerateFiles(tempPath, "*.pack").Single();
            var packfile = await System.IO.File.ReadAllBytesAsync(file);

            await WriteSideband(Response.Body, 1, packfile);
            await WritePktFlush(Response.Body);

            return new EmptyResult();
        }
        catch (InvalidOperationException)
        {
            await WriteSideband(Response.Body, 3, "ERROR: Failed to write packfile");
            return new EmptyResult();
        }
        catch (Exception)
        {
            await WriteSideband(Response.Body, 3, "ERROR: Internal Server Error.");
            return new EmptyResult();
        }
        finally
        {
            Directory.Delete(tempPath, true);
        }
    }

    private class Packet
    {
        public byte[] Data { get; set; } = null!;
        public bool IsFlush { get; set; }
        public bool IsDelimeter { get; set; }
    }
}