import * as nodemailer from "nodemailer";
import { sendMail } from "../src/index";

jest.mock("nodemailer");

describe("should send a mail", () => {
  it("should send an email", async () => {
    const subject = "Test Subject";
    const mailBody = "Test Body";

    process.env.MAIL_ADDRESS = "test@example.com";
    process.env.MAIL_SERVICE_PASSWORD = "testPassword";

    const createTransportMock = jest
      .spyOn(nodemailer, "createTransport")
      .mockReturnValue({
        sendMail: jest.fn().mockResolvedValueOnce({ messageId: "12345" }),
      } as any);

    await sendMail(subject, mailBody);

    expect(createTransportMock).toHaveBeenCalled();
    expect(
      createTransportMock.mock.results[0].value.sendMail
    ).toHaveBeenCalledWith({
      from: "scrape-manga",
      to: "test@example.com",
      subject: "Test Subject",
      text: "Test Body",
    });

    createTransportMock.mockRestore();
  });
});
