import { NewArrival } from "../src/type";
import { NewArrivalPresantater } from "../src/presentater/NewArrivalPresantater";

describe("NewArrivalPresantater", () => {
  it("should format subscribing new arrivals message correctly", () => {
    const newArrivals: NewArrival[] = [
      { mangaTitle: "九条の大罪", arrivalDate: "2023-01-01" },
      { mangaTitle: "イリオス", arrivalDate: "2023-01-02" },
    ];
    const storeName = "Test Store";

    const presenter = new NewArrivalPresantater(newArrivals, storeName);

    const expectedMessage =
      "Test Store\n2023-01-01 九条の大罪\n2023-01-02 イリオス\n";

    const result = presenter.format();
    expect(result).toEqual(expectedMessage);
  });

  it("should handle case when there are no subscribing new arrivals", () => {
    const newArrivals: NewArrival[] = [
      { mangaTitle: "Non-subscribed Manga", arrivalDate: "2023-01-01" },
    ];
    const storeName = "Test Store";

    const presenter = new NewArrivalPresantater(newArrivals, storeName);

    const expectedMessage =
      "Test Store\n\n今月は購読しているマンガの新入荷はありません。";

    const result = presenter.format();
    expect(result).toEqual(expectedMessage);
  });
});
