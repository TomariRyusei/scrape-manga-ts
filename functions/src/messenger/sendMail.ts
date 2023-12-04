import * as nodemailer from "nodemailer";

export const sendMail = async (subject: string, mailBody: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_SERVICE_PASSWORD,
    },
  });

  const mailOptions = {
    from: "scrape-manga",
    to: process.env.MAIL_ADDRESS,
    subject: subject,
    text: mailBody,
  };

  await transporter.sendMail(mailOptions);
};
