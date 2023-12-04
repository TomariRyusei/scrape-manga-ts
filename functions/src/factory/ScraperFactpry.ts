import { ScraperKaikatsuClub } from "../scraper/ScraperKaikatsuClub";
import { StoreInfo } from "../type";

export class ScraperFactpry {
  static create(storeInfo: StoreInfo) {
    switch (storeInfo.name) {
      case "快活クラブ 栄広小路店":
      case "快活クラブ 名古屋錦店":
        return new ScraperKaikatsuClub(storeInfo.name, storeInfo.url);
      default:
        throw new Error("スクレイピング対象の店舗名を正しく設定してください。");
    }
  }
}
