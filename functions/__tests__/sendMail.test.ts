import * as nodemailer from "nodemailer";
import { sendMail } from "../src/messenger/sendMail";

jest.mock("nodemailer");
const mockNodemailer = jest.mocked(nodemailer);

describe("should send a mail", () => {
  it("should send an email", async () => {
    const subject = "Test Subject";
    const mailBody = "Test Body";

    process.env.MAIL_ADDRESS = "test@example.com";
    process.env.MAIL_SERVICE_PASSWORD = "testPassword";

    mockNodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValueOnce({ messageId: "12345" }),
    } as any);

    await sendMail(subject, mailBody);

    expect(
      mockNodemailer.createTransport.mock.results[0].value.sendMail
    ).toHaveBeenCalledWith({
      from: "scrape-manga",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });
  });
});
