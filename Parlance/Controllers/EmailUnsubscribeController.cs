using JWT.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Parlance.Notifications.Channels.TranslationFreeze;
using Parlance.Notifications.Service;
using Parlance.Services.Projects;
using Parlance.Vicr123Accounts.Services;

namespace Parlance.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("limiter")]
public class EmailUnsubscribeController(
    IUnsubscribeService unsubscribeService,
    INotificationService notificationService,
    IProjectService projectService,
    IVicr123AccountsService accountsService) : Controller
{
    [HttpPost]
    public async Task<IActionResult> GetUnsubscribeOptions([FromBody] GetUnsubscribeOptionsRequestData data)
    {
        try
        {
            var subscriptionData = unsubscribeService.UnsubscribeData(data.Token);
            if (subscriptionData is null)
            {
                return BadRequest();
            }

            var subscription = notificationService.DecodeDatabaseSubscription(subscriptionData);

            object? autoSubscription = null;
            if (subscription.AutoSubscriptionSource is {} autoSubscriptionSource)
            {
                autoSubscription = new
                {
                    Type = autoSubscriptionSource.Event
                };
            }

            object retval;
            switch (subscription)
            {
                case TranslationFreezeNotificationChannelSubscription translationFreezeNotificationChannelSubscription:
                    var project =
                        await projectService.ProjectBySystemName(translationFreezeNotificationChannelSubscription.Project);
                    retval = new
                    {
                        Type = translationFreezeNotificationChannelSubscription.Channel,
                        translationFreezeNotificationChannelSubscription.Project,
                        ProjectName = project.Name,
                        AutoSubscription = autoSubscription
                    };
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(subscription));
            }
            
            return Json(new
            {
                EmailNotificationsOn = !await unsubscribeService.GetUnsubscriptionState(subscriptionData.UserId),
                Subscription = retval
            });
        }
        catch (ProjectNotFoundException)
        {
            return BadRequest();
        }
        catch (InvalidTokenPartsException)
        {
            return Unauthorized();
        }
        catch (SignatureVerificationException)
        {
            return Unauthorized();
        }
    }

    [HttpPost]
    [Route("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeRequestData data)
    {
        try
        {
            var subscriptionData = unsubscribeService.UnsubscribeData(data.Token);
            if (subscriptionData is null)
            {
                return BadRequest();
            }

            var subscription = notificationService.DecodeDatabaseSubscription(subscriptionData);
            
            switch (data.UnsubscribeOption)
            {
                case "UnsubscribeOnly":
                    await notificationService.UpsertSubscriptionPreference(subscription, false);
                    break;
                case "UnsubscribeTerminateAutoSubscription" when subscription.AutoSubscriptionSource is not null:
                    await notificationService.SetAutoSubscriptionPreference(subscription.AutoSubscriptionSource,
                        subscriptionData.UserId, false);
                    goto case "UnsubscribeOnly";
                case "UnsubscribeTotally":
                    await unsubscribeService.SetUnsubscriptionState(subscriptionData.UserId, true);
                    break;
                case "UnverifyEmail":
                    var user = await accountsService.UserById(subscriptionData.UserId);
                    await accountsService.UnverifyEmail(user);
                    break;
                default:
                    return BadRequest();
            }

            return NoContent();
        }
        catch (InvalidTokenPartsException)
        {
            return Unauthorized();
        }
        catch (SignatureVerificationException)
        {
            return Unauthorized();
        }
    }

    public class GetUnsubscribeOptionsRequestData
    {
        public required string Token { get; set; }
    }

    public class UnsubscribeRequestData
    {
        public required string Token { get; set; }
        
        public required string UnsubscribeOption { get; set; }
    }
}