import axios from "axios";
import { LineNotifier } from "../src/infrastructure/adapters/notification/lineNotifier";

jest.mock("axios");
const mockAxios = jest.mocked(axios);

describe("LINE Messaging API", () => {
  beforeEach(() => {
    const CHANNEL_ACCSESS_TOKEN = "test_access_token";
    const USER_ID = "test_user";
    process.env.CHANNEL_ACCSESS_TOKEN = CHANNEL_ACCSESS_TOKEN;
    process.env.USER_ID = USER_ID;
  });

  it("LINEでメッセージを送れること", async () => {
    const message = "Test message";
    const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/broadcast";

    const notifier = new LineNotifier(process.env.CHANNEL_ACCSESS_TOKEN, process.env.USER_ID);

    mockAxios.post.mockResolvedValue({ status: 200 });

    await notifier.sendNotification(message);

    expect(mockAxios.post).toHaveBeenCalledWith(
      LINE_MESSAGING_API_URL,
      { to: process.env.USER_ID, messages: [{ type: "text", text: message }] },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHANNEL_ACCSESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  });

  it("LINE通知の認証トークンがセットされていない場合、例外をスローすること", () => {
    expect(() => new LineNotifier(undefined, process.env.USER_ID)).toThrowError("LINE Notify token is not set");
  });

  it("LINE通知のユーザIDがセットされていない場合、例外をスローすること", () => {
    expect(() => new LineNotifier(process.env.CHANNEL_ACCSESS_TOKEN, undefined)).toThrowError(
      "LINE User ID is not set"
    );
  });
});
