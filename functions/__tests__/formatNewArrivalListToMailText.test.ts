import { formatSubscriptionsForMessage, NewArrival } from "../src/index";

describe("formatNewArrivalListToMailText", () => {
  const newArrivalList: NewArrival[] = [
    { arrivalDate: "2023-04-01", mangaTitle: "呪術廻戦" },
    { arrivalDate: "2023-04-02", mangaTitle: "ダーウィン事変" },
    { arrivalDate: "2023-04-03", mangaTitle: "九条の大罪" },
  ];

  it("returns a message for an empty list", () => {
    const emptyList: NewArrival[] = [];
    const result = formatSubscriptionsForMessage(emptyList);
    expect(result).toBe("今月は購読しているマンガの新入荷はありません。");
  });

  it("formats the new arrival list to mail text", () => {
    const result = formatSubscriptionsForMessage(newArrivalList);
    expect(result).toBe(
      `2023-04-01 呪術廻戦\n2023-04-02 ダーウィン事変\n2023-04-03 九条の大罪\n`
    );
  });
});
