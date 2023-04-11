import * as functions from "firebase-functions";
import puppeteer from "puppeteer";

// import { myMangaList } from "./myMangaList";

const scraper = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.navi-comi.com/20488/arrival-list/");
  await page.screenshot({
    path: "/Users/tryu/Desktop/kaikatsu_arrival-list.png",
  });
  await browser.close();
};
export const scrapeManga = functions.https.onRequest(
  async (request, response) => {
    functions.logger.info("Scraping started!", { structuredData: true });
    await scraper();
    functions.logger.info("Scraping completed!", { structuredData: true });
    response.send("OK!");
  }
);
