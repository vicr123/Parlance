using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Notifications.Channels.TranslationFreeze;
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
    
    [HttpGet]
    [Authorize]
    [Route("autosubscriptions")]
    public async Task<IActionResult> GetAutoSubscriptions()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        List<object> subscriptions = [];
        foreach (var subscription in notificationService.GetAutoSubscriptions())
        {
            subscriptions.Add(new
            {
                subscription.Channel,
                subscription.Event,
                Subscribed = (await notificationService.GetAutoSubscriptionPreference(subscription.Channel, subscription.Event, userId)).IsSubscribed
            });
        }
        
        return Json(subscriptions);
    }

    [HttpPost]
    [Authorize]
    [Route("autosubscriptions")]
    public async Task<IActionResult> SetAutoSubscription([FromBody] SetAutoSubscriptionRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        try
        {
            await notificationService.SetAutoSubscriptionPreference(data.Channel, data.Event, userId, data.Subscribed);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }
    
    [HttpGet]
    [Authorize]
    [Route("channels")]
    public async Task<IActionResult> GetChannels()
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        return Json(await notificationService.SavedSubscriptionPreferences(userId).Select(x => new
        {
            x.Channel,
            x.Enabled,
            SubscriptionData = x.GetSubscriptionData()
        }).ToListAsync());
    }
    
    [HttpPost]
    [Authorize]
    [Route("channels")]
    public async Task<IActionResult> SetChannelSubscription([FromBody] SetChannelSubscriptionRequestData data)
    {
        var userId = ulong.Parse(HttpContext.User.Claims.First(claim => claim.Type == Claims.UserId).Value);

        try
        {
            var preference = await notificationService.SavedSubscriptionPreferences(userId).SingleAsync(x =>
                x.Channel == data.Channel && x.GetSubscriptionData() == data.SubscriptionData);
            await notificationService.UpsertSubscriptionPreference(preference, data.Enabled);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return BadRequest();
        }
    }
    
    public class SetUnsubscriptionStateRequestData
    {
        public required bool Unsubscribed { get; set; }
    }
    
    public class SetAutoSubscriptionRequestData
    {
        public required string Channel { get; set; }
        
        public required string Event { get; set; }
        
        public required bool Subscribed { get; set; }
    }
    
    public class SetChannelSubscriptionRequestData
    {
        public required string Channel { get; set; }
        
        public required string SubscriptionData { get; set; }
        
        public required bool Enabled { get; set; }
    }
}