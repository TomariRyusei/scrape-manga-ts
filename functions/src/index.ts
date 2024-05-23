import * as functions from "firebase-functions/v1";
import axios from "axios";

import { storeInfo } from "./constants/storeInfo";
import { IScraper } from "./scraper/IScraper";
import { ScraperFactpry } from "./factory/ScraperFactpry";
import { NewArrivalPresantater } from "./presentater/NewArrivalPresantater";
import { getFormattedDate } from "./utils/getFormattedDate";
import { notifyLINE } from "./messenger/notifyLINE";
import { sendMail } from "./messenger/sendMail";

export const scrapeManga = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
    secrets: ["LINE_ACCESS_TOKEN", "MAIL_ADDRESS", "MAIL_SERVICE_PASSWORD"],
  })
  .region("asia-northeast1")
  .pubsub.schedule("0 10 1 * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    let messagelist: string[] = [];

    try {
      for (const store of storeInfo) {
        const scraper: IScraper = ScraperFactpry.create(store);
        await scraper.execute();

        const presentater = new NewArrivalPresantater(scraper);
        const formattedNewArrivalList = presentater.format();
        messagelist.push(formattedNewArrivalList);
      }
      await notifyLINE(`\n\n${getFormattedDate()}の新刊入荷情報\n\n${messagelist.join("\n\n")}`);
    } catch (e: any) {
      console.error(e);
      if (axios.isAxiosError(e)) {
        await sendMail("\nLINE APIとの通信でエラーが発生しました\n", e.message);
      } else {
        await notifyLINE(`\n\nサーバーでエラーが発生しました。\n\n${e.message}`);
      }
    }
  });
