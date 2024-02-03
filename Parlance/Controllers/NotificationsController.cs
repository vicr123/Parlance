using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Notifications.Service;
using Parlance.Vicr123Accounts.Authentication;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class NotificationsController(INotificationService notificationService, IUnsubscribeService unsubscribeService, IVicr123AccountsService accountsService) : Controller
{
    [HttpGet]
    [Authorize]
    [Route("unsubscription")]
    public async Task<IActionResult> GetUnsubscriptionState()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        return Json(new
        {
            Unsubscribed = await unsubscribeService.GetUnsubscriptionState(userId)
        });
    }
    
    [HttpPost]
    [Authorize]
    [Route("unsubscription")]
    public async Task<IActionResult> SetUnsubscriptionState([FromBody] SetUnsubscriptionStateRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        await unsubscribeService.SetUnsubscriptionState(userId, data.Unsubscribed);
        return NoContent();
    }

    public class SetUnsubscriptionStateRequestData
    {
        public required bool Unsubscribed { get; set; }
    }
}