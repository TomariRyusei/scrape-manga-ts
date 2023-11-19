import * as functions from "firebase-functions";
import puppeteer from "puppeteer";
import axios from "axios";
import * as FormData from "form-data";
import * as nodemailer from "nodemailer";

import { mySubscriptions } from "./mySubscriptions";

export type NewArrival = {
  arrivalDate: string | null;
  mangaTitle: string | null;
};

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
    try {
      const allNewArrivals = await getAllNewArrivals();
      const subscribingTitles =
        getSubscribingTitlesFromAllNewArrivals(allNewArrivals);
      const message = formatSubscriptionsForMessage(subscribingTitles);
      await notifyLINE(`\n${getFormattedDate()}の新刊入荷情報\n\n${message}`);
    } catch (e: any) {
      console.error(e);
      if (axios.isAxiosError(e)) {
        await sendMail("LINE APIとの通信でエラーが発生しました", e.message);
      } else {
        await notifyLINE(`\nサーバーでエラーが発生しました。\n\n${e.message}`);
      }
    }
  });

const getAllNewArrivals = async (): Promise<NewArrival[]> => {
  const newArrivals: NewArrival[] = [];
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
  await page.goto("https://www.navi-comi.com/20488/arrival-list/");

  // 次のページがなくなるまでスクレイピングを繰り返す
  while (true) {
    const newArrivalDlElem = await page.$("dl");

    if (!newArrivalDlElem) {
      throw new Error(
        "DL要素が見つかりませんでした。対象ページが変更されたようです。"
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

      newArrivals.push({
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

  return newArrivals;
};

export const getSubscribingTitlesFromAllNewArrivals = (
  newArrivals: NewArrival[]
): NewArrival[] => {
  return newArrivals.filter((newArrival) =>
    mySubscriptions.some((title) => newArrival.mangaTitle?.includes(title))
  );
};

export const formatSubscriptionsForMessage = (
  newArrivals: NewArrival[]
): string => {
  if (!newArrivals.length) {
    return "今月は購読しているマンガの新入荷はありません。";
  }

  return newArrivals.reduce((previousValue, currentValue) => {
    return (
      previousValue + `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
    );
  }, "");
};

export const getFormattedDate = () => {
  const japanLocaleString = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  return japanLocaleString;
};

const notifyLINE = async (message: string) => {
  const LINE_NOTIFY_API_URL = "https://notify-api.line.me/api/notify";

  const formData = new FormData();
  formData.append("message", message);

  const headers = {
    Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  await axios.post(LINE_NOTIFY_API_URL, formData, { headers });
};

const sendMail = async (subject: string, mailBody: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ADDRESS,
      pass: process.env.MAIL_SERVICE_PASSWORD,
    },
  });

  const mailOptions = {
    from: "scrape-manga",
    to: process.env.MAIL_ADDRESS,
    subject: subject,
    text: mailBody,
  };

  await transporter.sendMail(mailOptions);
};
