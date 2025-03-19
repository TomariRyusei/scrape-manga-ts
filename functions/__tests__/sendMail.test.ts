import * as nodemailer from "nodemailer";
import { EmailNotifier } from "../src/infrastructure/adapters/notification/emailNotifier";

jest.mock("nodemailer");
const mockNodemailer = jest.mocked(nodemailer);

describe("should send a mail", () => {
  it("メールを送信できること", async () => {
    const message = "Test message";
    const emailConfig = {
      auth: { user: "test@example.com", pass: "testPassword" },
    };
    const recipientEmail = "test@example.com";

    mockNodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValueOnce({ messageId: "12345" }),
    } as any);

    const notifier = new EmailNotifier(emailConfig, recipientEmail);

    await notifier.sendNotification(message);

    expect(mockNodemailer.createTransport.mock.results[0].value.sendMail).toHaveBeenCalledWith({
      from: "test@example.com",
      to: "test@example.com",
      subject: "漫画新刊情報",
      text: "Test message",
    });
  });

  it("認証情報のユーザーID(メールアドレス)がセットされていない場合、例外をスローすること", () => {
    expect(
      () => new EmailNotifier({ auth: { user: undefined, pass: "testPassword" } }, "test@example.com")
    ).toThrowError("Email configuration is not set");
  });

  it("認証情報のパスワードがセットされていない場合、例外をスローすること", () => {
    expect(
      () => new EmailNotifier({ auth: { user: "test@example.com", pass: undefined } }, "test@example.com")
    ).toThrowError("Email configuration is not set");
  });

  it("送信先メールアドレスがセットされていない場合、例外をスローすること", () => {
    expect(
      () => new EmailNotifier({ auth: { user: "test@example.com", pass: "testPassword" } }, undefined)
    ).toThrowError("Email configuration is not set");
  });
});
