import * as functions from "firebase-functions";
import { MangaService } from "./domain/services/mangaService";
import { ScrapeMangaUseCase } from "./application/useCases/scrapeMangaUseCase";
import { WebScraper } from "./infrastructure/adapters/scraping/webScraper";
import { LineNotifier } from "./infrastructure/adapters/notification/lineNotifier";
import { EmailNotifier } from "./infrastructure/adapters/notification/emailNotifier";
import { myMangaList } from "./infrastructure/data/myMangaList";

const SCRAPING_STORE_NAME = "快活クラブ 栄広小路店";
const SCRAPING_URL = "https://www.navi-comi.com/20488/arrival-list/";
const NOTIFIATION_TYPE: "line" | "email" = "line";
const secrets = ["CHANNEL_ACCSESS_TOKEN", "USER_ID", "MAIL_ADDRESS", "MAIL_SERVICE_PASSWORD"];

export const scrapeManga = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
    secrets: secrets,
  })
  .region("asia-northeast1")
  .pubsub.schedule("0 10 1 * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    const LINE_NOTIFY_TOKEN = process.env.CHANNEL_ACCSESS_TOKEN;
    const LINE_USER_ID = process.env.USER_ID;

    const EMAIL_CONFIG = {
      auth: {
        user: process.env.MAIL_ADDRESS,
        pass: process.env.MAIL_SERVICE_PASSWORD,
      },
    };
    const RECIPIENT_EMAIL = process.env.MAIL_ADDRESS;

    const mangaService = new MangaService(SCRAPING_STORE_NAME);
    const scraper = new WebScraper();

    let notifier;
    if (NOTIFIATION_TYPE === "line") {
      notifier = new LineNotifier(LINE_NOTIFY_TOKEN, LINE_USER_ID);
    } else {
      notifier = new EmailNotifier(EMAIL_CONFIG, RECIPIENT_EMAIL);
    }

    const useCase = new ScrapeMangaUseCase(mangaService, scraper, notifier, myMangaList, SCRAPING_URL);

    try {
      await useCase.execute();
      console.log("Manga scraping completed successfully");
      return null;
    } catch (error) {
      console.error("Error executing manga scraping:", error);
      throw error;
    }
  });

// 手動実行用のHTTPエンドポイント（テスト用）
export const scrapeMangaManually = functions
  .runWith({
    timeoutSeconds: 300,
    memory: "1GB",
    secrets: secrets,
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const mangaService = new MangaService(SCRAPING_STORE_NAME);
    const scraper = new WebScraper();

    let notifier;
    if (NOTIFIATION_TYPE === "line") {
      const LINE_NOTIFY_TOKEN = process.env.CHANNEL_ACCSESS_TOKEN;
      const LINE_USER_ID = process.env.USER_ID;
      notifier = new LineNotifier(LINE_NOTIFY_TOKEN, LINE_USER_ID);
    } else {
      const emailConfig = {
        auth: {
          user: process.env.MAIL_ADDRESS,
          pass: process.env.MAIL_SERVICE_PASSWORD,
        },
      };
      const recipientEmail = process.env.MAIL_ADDRESS;
      notifier = new EmailNotifier(emailConfig, recipientEmail);
    }

    const useCase = new ScrapeMangaUseCase(mangaService, scraper, notifier, myMangaList, SCRAPING_URL);

    try {
      await useCase.execute();
      res.status(200).send("Manga scraping completed successfully");
    } catch (error) {
      console.error("Error executing manga scraping:", error);
      res.status(500).send("Error executing manga scraping");
    }
  });
