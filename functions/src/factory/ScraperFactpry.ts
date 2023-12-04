import { ScraperKaikatsuNishiki } from "../scraper/ScraperKaikatsuNishiki";
import { ScraperKaikatsuSakaeHirokoji } from "../scraper/ScraperKaikatsuSakaeHirokoji";

export class ScraperFactpry {
  static create(storeName: string) {
    switch (storeName) {
      case "快活クラブ 栄広小路店":
        return new ScraperKaikatsuSakaeHirokoji();
      case "快活クラブ 名古屋錦店":
        return new ScraperKaikatsuNishiki();
      default:
        throw new Error("スクレイピング対象の店舗名を正しく設定してください。");
    }
  }
}
