import { ScraperFactpry } from "../src/factory/ScraperFactpry";
import { ScraperKaikatsuClub } from "../src/scraper/ScraperKaikatsuClub";

jest.mock("../src/scraper/ScraperKaikatsuClub");

describe("ScraperFactory Test", () => {
  it("should create ScraperKaikatsuClub instance for valid store name", () => {
    const storeInfo = {
      name: "快活クラブ 栄広小路店",
      url: "https://example.com",
    };
    const scraper = ScraperFactpry.create(storeInfo);
    expect(ScraperKaikatsuClub).toHaveBeenCalledWith(
      storeInfo.name,
      storeInfo.url
    );
    expect(scraper instanceof ScraperKaikatsuClub).toBe(true);
  });

  it("should throw an error for invalid store names", () => {
    const storeInfo = { name: "Invalid Store", url: "https://example.com" };
    expect(() => ScraperFactpry.create(storeInfo)).toThrowError(
      "スクレイピング対象の店舗名を正しく設定してください。"
    );
  });
});
