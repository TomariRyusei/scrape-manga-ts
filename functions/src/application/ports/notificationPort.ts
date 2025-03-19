export interface NotificationPort {
  sendNotification(message: string): Promise<void>;
}
