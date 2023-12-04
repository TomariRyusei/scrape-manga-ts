import * as functions from "firebase-functions";
import axios from "axios";

import { subscriptionList } from "./constants/subscriptionList";
import { storeNames } from "./constants/storeNames";
import { IScraper } from "./scraper/IScraper";
import { ScraperFactpry } from "./factory/ScraperFactpry";
import { getFormattedDate } from "./utils/getFormattedDate";
import { getSubscribingNewArrivals } from "./utils/getSubscribingNewArrivals";
import { formatSubscribingNewArrivalsForMessage } from "./utils/formatSubscribingNewArrivalsForMessage";
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
    let messageToSend: string[] = [];

    try {
      for (const storeName of storeNames) {
        const scraper: IScraper = ScraperFactpry.create(storeName);
        await scraper.execute();

        const subscribingNewArrivals = getSubscribingNewArrivals(
          scraper.newArrivals,
          subscriptionList
        );

        const message = formatSubscribingNewArrivalsForMessage(
          storeName,
          subscribingNewArrivals
        );
        messageToSend.push(message);
      }
      await notifyLINE(
        `\n\n${getFormattedDate()}の新刊入荷情報\n\n${messageToSend.join(
          "\n\n"
        )}`
      );
    } catch (e: any) {
      console.error(e);
      if (axios.isAxiosError(e)) {
        await sendMail("\nLINE APIとの通信でエラーが発生しました", e.message);
      } else {
        await notifyLINE(
          `\n\nサーバーでエラーが発生しました。\n\n${e.message}`
        );
      }
    }
  });
