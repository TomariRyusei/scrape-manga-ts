import axios from "axios";

export const notifyLINE = async (message: string) => {
  const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/broadcast";

  const headers = {
    "Authorization": `Bearer ${process.env.CHANNEL_ACCSESS_TOKEN}`,
    "Content-Type": "application/json",
  };

  await axios.post(
    LINE_MESSAGING_API_URL,
    { to: process.env.USER_ID, messages: [{ type: "text", text: message }] },
    { headers }
  );
};
