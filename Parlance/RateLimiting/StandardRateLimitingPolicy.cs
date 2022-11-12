using System.Net;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Parlance.RateLimiting;

public class StandardRateLimitingPolicy : IRateLimiterPolicy<IPAddress>
{
    private readonly RateLimitingOptions RateLimitingOptions;

    public StandardRateLimitingPolicy(IOptions<RateLimitingOptions> options)
    {
        RateLimitingOptions = options.Value;
    }

    public RateLimitPartition<IPAddress> GetPartition(HttpContext httpContext)
    {
        return RateLimitPartition.GetSlidingWindowLimiter(httpContext.Connection.RemoteIpAddress, _ =>
            new SlidingWindowRateLimiterOptions
            {
                PermitLimit = RateLimitingOptions.PermitLimit,
                Window = TimeSpan.FromSeconds(RateLimitingOptions.Window),
                SegmentsPerWindow = RateLimitingOptions.SegmentsPerWindow,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            })!;
    }

    public Func<OnRejectedContext, CancellationToken, ValueTask>? OnRejected { get; }
}