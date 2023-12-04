import { getFormattedDate } from "../src/utils/getFormattedDate";

describe("getFormattedDate", () => {
  it("returns a string", () => {
    const result = getFormattedDate();
    expect(typeof result).toBe("string");
  });

  it("returns a formatted date in Japanese", () => {
    const result = getFormattedDate();
    expect(result).toMatch(/^\d{4}年([1-9]|1[0-2])月$/);
  });
});
