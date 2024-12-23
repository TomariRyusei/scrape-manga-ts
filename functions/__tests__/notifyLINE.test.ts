import axios from "axios";
import { notifyLINE } from "../src/messenger/notifyLINE";

jest.mock("axios");
const mockAxios = jest.mocked(axios);

describe("LINE Messaging API", () => {
  it("should send a message to LINE", async () => {
    const message = "Test message";
    const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/broadcast";
    const CHANNEL_ACCSESS_TOKEN = "test_access_token";
    const USER_ID = "test_user";

    process.env.CHANNEL_ACCSESS_TOKEN = CHANNEL_ACCSESS_TOKEN;
    process.env.USER_ID = USER_ID;

    mockAxios.post.mockResolvedValue({ status: 200 });

    await notifyLINE(message);

    expect(mockAxios.post).toHaveBeenCalledWith(
      LINE_MESSAGING_API_URL,
      { to: process.env.USER_ID, messages: [{ type: "text", text: message }] },
      {
        headers: {
          "Authorization": `Bearer ${CHANNEL_ACCSESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  });
});
