import { NewArrivalPresantater } from "../src/presentater/NewArrivalPresantater";
import { ScraperKaikatsuClub } from "../src/scraper/ScraperKaikatsuClub";

describe("NewArrivalPresantater", () => {
  it("should format subscribing new arrivals message correctly", () => {
    const scraper = new ScraperKaikatsuClub("Test Store", "https://test.com");
    scraper.newArrivals = [
      { mangaTitle: "九条の大罪", arrivalDate: "2023-01-01" },
      { mangaTitle: "イリオス", arrivalDate: "2023-01-02" },
    ];

    const presenter = new NewArrivalPresantater(scraper);

    const expectedMessage =
      "Test Store\n2023-01-01 九条の大罪\n2023-01-02 イリオス\n";

    const result = presenter.format();
    expect(result).toEqual(expectedMessage);
  });

  it("should handle case when there are no subscribing new arrivals", () => {
    const scraper = new ScraperKaikatsuClub("Test Store", "https://test.com");
    scraper.newArrivals = [
      { mangaTitle: "Non-subscribed Manga", arrivalDate: "2023-01-01" },
    ];

    const presenter = new NewArrivalPresantater(scraper);

    const expectedMessage =
      "Test Store\n\n今月は購読しているマンガの新入荷はありません。";

    const result = presenter.format();
    expect(result).toEqual(expectedMessage);
  });
});
