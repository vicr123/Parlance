namespace Parlance.RateLimiting;

public class RateLimitingOptions
{
    public int PermitLimit { get; set; }
    public int Window { get; set; }
    public int SegmentsPerWindow { get; set; }
}