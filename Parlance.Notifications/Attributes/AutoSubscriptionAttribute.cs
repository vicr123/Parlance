namespace Parlance.Notifications.Attributes;
                                      
[AttributeUsage(AttributeTargets.Class)]
public class AutoSubscriptionAttribute : Attribute
{
    // ReSharper disable once UnusedParameter.Local
    public AutoSubscriptionAttribute(Type type) {
    }
}