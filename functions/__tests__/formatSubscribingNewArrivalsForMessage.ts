import { formatSubscribingNewArrivalsForMessage } from "../src/utils/formatSubscribingNewArrivalsForMessage";
import { NewArrival } from "../src/type";

describe("formatNewArrivalListToMailText", () => {
  const newArrivalList: NewArrival[] = [
    { arrivalDate: "2023-04-01", mangaTitle: "呪術廻戦" },
    { arrivalDate: "2023-04-02", mangaTitle: "ダーウィン事変" },
    { arrivalDate: "2023-04-03", mangaTitle: "九条の大罪" },
  ];
  const storeName = "快活クラブ 栄広小路店";

  it("returns a message for an empty list", () => {
    const emptyList: NewArrival[] = [];
    const result = formatSubscribingNewArrivalsForMessage(storeName, emptyList);
    expect(result).toBe(
      `${storeName}\n\n今月は購読しているマンガの新入荷はありません。`
    );
  });

  it("formats the new arrival list to mail text", () => {
    const result = formatSubscribingNewArrivalsForMessage(
      storeName,
      newArrivalList
    );
    expect(result).toBe(
      `${storeName}\n2023-04-01 呪術廻戦\n2023-04-02 ダーウィン事変\n2023-04-03 九条の大罪\n`
    );
  });
});
