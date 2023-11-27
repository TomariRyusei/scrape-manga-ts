import axios from "axios";
import * as FormData from "form-data";
import { notifyLINE } from "../src/index";

jest.mock("axios");

describe("notifyLINE", () => {
  it("should send a message to LINE", async () => {
    const message = "Test message";
    const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";
    const LINE_ACCESS_TOKEN = "test_access_token";

    process.env.LINE_ACCESS_TOKEN = LINE_ACCESS_TOKEN;

    const axiosPostMock = jest
      .spyOn(axios, "post")
      .mockResolvedValue({ status: 200 });

    await notifyLINE(message);

    expect(axiosPostMock).toHaveBeenCalledWith(
      LINE_NOTIFY_API_URL,
      expect.any(FormData),
      {
        headers: {
          Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
  });
});
