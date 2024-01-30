namespace Parlance.Notifications.Channels;

public interface INotificationChannel
{
    public static abstract string ChannelName { get; }
}
