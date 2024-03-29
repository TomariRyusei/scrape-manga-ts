import axios from "axios";
import { notifyLINE } from "../src/messenger/notifyLINE";

jest.mock("axios");
const mockAxios = jest.mocked(axios);

describe("notifyLINE", () => {
  it("should send a message to LINE", async () => {
    const message = "Test message";
    const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";
    const LINE_ACCESS_TOKEN = "test_access_token";

    process.env.LINE_ACCESS_TOKEN = LINE_ACCESS_TOKEN;

    mockAxios.post.mockResolvedValue({ status: 200 });

    await notifyLINE(message);

    expect(mockAxios.post).toHaveBeenCalledWith(
      LINE_NOTIFY_API_URL,
      { message },
      {
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  });
});
