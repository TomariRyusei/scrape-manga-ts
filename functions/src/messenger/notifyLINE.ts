import axios from "axios";

export const notifyLINE = async (message: string) => {
  const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";

  const headers = {
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  await axios.post(LINE_NOTIFY_API_URL, { message }, { headers });
};
