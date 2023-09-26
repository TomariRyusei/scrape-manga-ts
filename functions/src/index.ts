import * as functions from "firebase-functions";
import puppeteer from "puppeteer";
import * as nodemailer from "nodemailer";

import { mySubscribingTitles } from "./mySubscribingTitles";

export const config = functions.config();

export type NewArrival = {
  arrivalDate: string | null;
  mangaTitle: string | null;
};

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
    mySubscribingTitles.some((title) => newArrival.mangaTitle?.includes(title))
  );
};

export const formatSubscribingTitlesToMailText = (
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

const sendMail = async (mailBody: string) => {
  const storeName = config.store.name;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmail.email_address,
      pass: config.gmail.password,
    },
  });

  const mailOptions = {
    from: "マンガ新刊情報通知サービス",
    to: config.gmail.email_address,
    subject: `${getFormattedDate()}の新刊入荷情報`,
    text: `${storeName}\n\n${mailBody}`,
  };

  await transporter.sendMail(mailOptions);
};

export const scrapeManga = functions
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .region("asia-northeast1")
  .pubsub.schedule("0 10 1 * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    try {
      const allNewArrivals = await getAllNewArrivals();
      const subscribingTitles =
        getSubscribingTitlesFromAllNewArrivals(allNewArrivals);
      await sendMail(formatSubscribingTitlesToMailText(subscribingTitles));
    } catch (e: any) {
      console.error(e);
      if (e instanceof Error) {
        await sendMail(`An error occurred: ${e.message}`);
      } else {
        await sendMail(`An error occurred: ${JSON.stringify(e)}`);
      }
    }
  });
