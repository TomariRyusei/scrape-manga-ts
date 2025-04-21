import axios from "axios";
import * as cheerio from "cheerio";
import { ScrapingPort } from "../../../application/ports/scrapingPort";
import { Manga } from "../../../domain/entities/manga";

export class WebScraperCheerio implements ScrapingPort {
  async scrapeMangaList(url: string): Promise<Manga[]> {
    const mangaList: Manga[] = [];

    try {
      let currentUrl = url;

      while (true) {
        const response = await axios.get(currentUrl);
        const $ = cheerio.load(response.data);
        const newArrivalDlElem = $("dl");

        if (newArrivalDlElem.length === 0) {
          throw new Error("DL要素が見つかりませんでした。対象ページが変更されたようです。");
        }

        const newArrivalDtElems = newArrivalDlElem.find("dt");
        const newArrivalDdElems = newArrivalDlElem.find("dd");

        for (let i = 0; i < newArrivalDtElems.length; i++) {
          const arrivalDate = $(newArrivalDtElems[i]).text().trim();
          const ddTitle = $(newArrivalDdElems[i]).find("div.title");

          if (ddTitle.length === 0) continue;

          const title = ddTitle.text().trim();

          mangaList.push({
            title,
            releaseDate: arrivalDate,
          });
        }

        // 次のページを探す
        const currentPageLi = $("#list_footer div ul li:has(strong)");
        const nextPageLi = currentPageLi.next();
        const nextPageLink = nextPageLi.find("a");

        if (nextPageLink.length === 0) {
          break;
        }

        // 次のページのURLを取得
        currentUrl = new URL(nextPageLink.attr("href") || "", new URL(currentUrl).origin).toString();
      }

      return mangaList;
    } catch (error) {
      console.error("Error in WebScraper:", error);
      throw error;
    }
  }
}
