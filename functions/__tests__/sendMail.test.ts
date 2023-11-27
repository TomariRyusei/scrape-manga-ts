import * as nodemailer from "nodemailer";
import { sendMail } from "../src/index";

jest.mock("nodemailer");

describe("should send a mail", () => {
  it("should send an email", async () => {
    const subject = "Test Subject";
    const mailBody = "Test Body";

    process.env.MAIL_ADDRESS = "test@example.com";
    process.env.MAIL_SERVICE_PASSWORD = "testPassword";

    const sendMailMock = jest.fn().mockResolvedValue({ messageId: "12345" });

    // nodemailer.createTransportをモックし、そのモックのsendMailメソッドがsendMailMockを呼ぶように設定
    (
      nodemailer.createTransport as jest.MockedFunction<
        typeof nodemailer.createTransport
      >
    ).mockReturnValue({
      sendMail: sendMailMock,
    } as any);

    await sendMail(subject, mailBody);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "scrape-manga",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });
  });
});
