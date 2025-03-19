import * as nodemailer from "nodemailer";
import { NotificationPort } from "../../../application/ports/notificationPort";

export class EmailNotifier implements NotificationPort {
  constructor(
    private emailConfig: {
      auth: {
        user: string | undefined;
        pass: string | undefined;
      };
    },
    private recipientEmail: string | undefined
  ) {
    if (!emailConfig.auth.user || !emailConfig.auth.pass || !recipientEmail) {
      throw new Error("Email configuration is not set");
    }
  }

  async sendNotification(message: string): Promise<void> {
    try {
      const transporter = nodemailer.createTransport(this.emailConfig);
      await transporter.sendMail({
        from: this.emailConfig.auth.user,
        to: this.recipientEmail,
        subject: "漫画新刊情報",
        text: message,
      });
    } catch (error) {
      console.error("Error in EmailNotifier:", error);
      throw error;
    }
  }
}
