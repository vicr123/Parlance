using System.Globalization;
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

    private static async Task WritePktLine(Stream stream)
    {
        await stream.WriteAsync(Encoding.UTF8.GetBytes("0000"));
    }

    private static async Task WritePktLine(Stream stream, byte[] pktLine)
    {
        var len = pktLine.Length + 4;
        await stream.WriteAsync(Encoding.UTF8.GetBytes(len.ToString("x4")));
        await stream.WriteAsync(pktLine);
    }

    private async Task<byte[]> GetPktLine(Stream stream)
    {
        var len = new byte[4];
        var lenLen = await stream.ReadAsync(len, 0, 4);
        if (lenLen != 4) throw new InvalidDataException();

        var lenInt = int.Parse(Encoding.UTF8.GetString(len), NumberStyles.HexNumber);
        if (lenInt == 0) return Array.Empty<byte>();

        lenInt -= 4;

        var data = new byte[lenInt];
        var dataLen = await stream.ReadAsync(data, 0, lenInt);
        if (dataLen != lenInt) throw new InvalidDataException();

        return data;
    }

    private static async Task WriteRef(Stream stream, Reference reference)
    {
        using var refStream = new MemoryStream();
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(reference.ResolveToDirectReference().TargetIdentifier));
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(" "));
        await refStream.WriteAsync(Encoding.UTF8.GetBytes(reference.CanonicalName));
        // await refStream.WriteAsync(new byte[] { 0 });
        await refStream.WriteAsync(Encoding.UTF8.GetBytes("\n"));
        await WritePktLine(stream, refStream.ToArray());
    }

    private static async Task WriteSidechannel(Stream stream, string text)
    {
        using var sidechannelStream = new MemoryStream();
        await sidechannelStream.WriteAsync(new byte[] { 2 });
        await sidechannelStream.WriteAsync(Encoding.UTF8.GetBytes(text));
        await sidechannelStream.WriteAsync(Encoding.UTF8.GetBytes("\n"));
        await WritePktLine(stream, sidechannelStream.ToArray());
    }

    [HttpGet]
    [Route("info/refs")]
    public async Task<IActionResult> GitHttpGetRefs(string project, [FromQuery] string? service = null)
    {
        //Only allow git-upload-pack
        if (service is not "git-upload-pack") return Forbid();

        if (_versionControlService is not GitVersionControlService gitService) return NotFound();

        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            var stream = new MemoryStream();
            using var repo = gitService.ProjectRepository(proj);

            await WritePktLine(stream, Encoding.UTF8.GetBytes("# service=git-upload-pack\n"));
            await WritePktLine(stream);
            await WriteRef(stream, repo.Head.Reference);
            foreach (var reference in repo.Refs.Where(reference => reference.IsLocalBranch))
                await WriteRef(stream, reference);
            await WritePktLine(stream);

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

        try
        {
            var p = await _projectService.ProjectBySystemName(project);
            var proj = p.GetParlanceProject();

            using var repo = gitService.ProjectRepository(proj);

            var wantRefs = new List<string>();
            var haveRefs = new List<string>();
            byte[] pktLine;
            while ((pktLine = await GetPktLine(Request.Body)).Length != 0)
            {
                var pktStringParts = Encoding.UTF8.GetString(pktLine).Split(" ");
                switch (pktStringParts[0])
                {
                    case "want":
                        wantRefs.Add(pktStringParts[1].Trim());
                        break;
                    case "have":
                        haveRefs.Add(pktStringParts[1].Trim());
                        break;
                    default:
                        throw new InvalidDataException();
                }
            }

            //Ensure want refs are okay
            if (wantRefs.Count == 0) return BadRequest();

            if (!wantRefs.All(referenceId =>
                {
                    return repo.Refs.Any(reference =>
                        reference.ResolveToDirectReference().TargetIdentifier == referenceId);
                }))
                return BadRequest();

            var common = new List<string>();
            foreach (var wantRef in wantRefs)
            {
            }

            // repo.ObjectDatabase.Pack(new PackBuilderOptions(""), packBuilder => { });

            var stream = new MemoryStream();
            await WriteSidechannel(stream, "Sidechannel Data 1");
            await WriteSidechannel(stream, "Sidechannel Data 2");
            await WriteSidechannel(stream, "Sidechannel Data 3");
            await WriteSidechannel(stream, "Sidechannel Data 4");
            await WriteSidechannel(stream, "Sidechannel Data 5");
            
            stream.Seek(0, SeekOrigin.Begin);
            return new FileStreamResult(stream, "application/x-git-upload-pack-advertisement");
        }
        catch (InvalidDataException)
        {
            return BadRequest();
        }
    }
}