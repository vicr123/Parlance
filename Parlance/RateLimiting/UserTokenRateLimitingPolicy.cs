using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace Parlance.RateLimiting;

public class UserTokenRateLimitingPolicy : IRateLimiterPolicy<IPAddress>
{
    public RateLimitPartition<IPAddress> GetPartition(HttpContext httpContext)
    {
        return RateLimitPartition.GetSlidingWindowLimiter(httpContext.Connection.RemoteIpAddress, _ =>
            new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(10),
                SegmentsPerWindow = 10,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            })!;
    }

    public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected { get; }
}