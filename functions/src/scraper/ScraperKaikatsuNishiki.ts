import puppeteer from "puppeteer";

import { IScraper } from "./IScraper";
import { NewArrival } from "../type";

export class ScraperKaikatsuNishiki implements IScraper {
  readonly storeName: string = "快活クラブ 名古屋錦店";
  readonly url: string = "https://www.navi-comi.com/20774/arrival-list/";
  newArrivals: NewArrival[] = [];

  async execute(): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
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
    await page.goto(this.url);
    // 次のページがなくなるまでスクレイピングを繰り返す
    while (true) {
      const newArrivalDlElem = await page.$("dl");

      if (!newArrivalDlElem) {
        throw new Error(
          `${this.storeName}:DL要素が見つかりませんでした。対象ページが変更されたようです。`
        );
      }

      const newArrivalDtElems = await newArrivalDlElem.$$("dt");
      const newArrivalDdElems = await newArrivalDlElem.$$("dd");

      for (let i = 0; i < newArrivalDtElems.length; i++) {
        const arrivalDate = await (
          await newArrivalDtElems[i].getProperty("textContent")
        ).jsonValue();

        const ddTtile = await newArrivalDdElems[i].$("div.title");

        if (!ddTtile) continue;

        const mangaTitle = await (
          await ddTtile.getProperty("textContent")
        ).jsonValue();

        this.newArrivals.push({
          arrivalDate: arrivalDate,
          mangaTitle: mangaTitle,
        });
      }

      const [currentPageElem] = await page.$x(
        '//div[@id="list_footer"]/div/ul/li[strong]'
      );
      const nextPageElem = await currentPageElem.getProperty(
        "nextElementSibling"
      );
      const nextPageLink = await nextPageElem.asElement()?.$("a");

      if (!nextPageLink) {
        break;
      }

      await Promise.all([page.waitForNavigation(), nextPageLink.click()]);
    }

    await browser.close();

    console.log(`${this.storeName}:スクレイピング完了`);
  }
}
