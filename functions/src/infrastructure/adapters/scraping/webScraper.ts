import puppeteer from "puppeteer";
import { ScrapingPort } from "../../../application/ports/scrapingPort";
import { Manga } from "../../../domain/entities/manga";

export class WebScraper implements ScrapingPort {
  async scrapeMangaList(url: string): Promise<Manga[]> {
    const mangaList: Manga[] = [];

    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-setuid-sandbox",
          "--no-first-run",
          "--no-sandbox",
          "--no-zygote",
          "--single-process",
        ],
      });
      const page = await browser.newPage();
      await page.goto(url);

      // 次のページがなくなるまでスクレイピングを繰り返す
      while (true) {
        const newArrivalDlElem = await page.$("dl");

        if (!newArrivalDlElem) {
          throw new Error("DL要素が見つかりませんでした。対象ページが変更されたようです。");
        }

        const newArrivalDtElems = await newArrivalDlElem.$$("dt");
        const newArrivalDdElems = await newArrivalDlElem.$$("dd");

        for (let i = 0; i < newArrivalDtElems.length; i++) {
          const arrivalDate = (await (await newArrivalDtElems[i].getProperty("textContent")).jsonValue()) ?? "";

          const ddTtile = await newArrivalDdElems[i].$("div.title");

          if (!ddTtile) continue;

          const title = (await (await ddTtile.getProperty("textContent")).jsonValue()) ?? "";

          mangaList.push({
            title,
            releaseDate: arrivalDate,
          });
        }

        const [currentPageElem] = await page.$x('//div[@id="list_footer"]/div/ul/li[strong]');
        const nextPageElem = await currentPageElem.getProperty("nextElementSibling");
        const nextPageLink = await nextPageElem.asElement()?.$("a");

        if (!nextPageLink) {
          break;
        }

        await Promise.all([page.waitForNavigation(), nextPageLink.click()]);
      }

      return mangaList;
    } catch (error) {
      console.error("Error in WebScraper:", error);
      throw error;
    }
  }
}
