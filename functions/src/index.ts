import * as functions from "firebase-functions";
import puppeteer from "puppeteer";
import * as nodemailer from "nodemailer";

import { mySubScriptionTitleList } from "./myMangaList";

export const config = functions.config();

export type NewArrival = {
  arrivalDate: string | null;
  mangaTitle: string | null;
};

const execScrapingManga = async (): Promise<NewArrival[]> => {
  // 全新入荷マンガ情報を格納する配列
  const newArrivalList: NewArrival[] = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
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

      newArrivalList.push({
        arrivalDate: arrivalDate,
        mangaTitle: mangaTitle,
      });
    }

    // 配下にstrong要素を持つli要素 = 現在のページを示すページネーションを取得
    const [currentPageElem] = await page.$x(
      '//div[@id="list_footer"]/div/ul/li[strong]'
    );
    // 現在のページを示すページネーションの次のli要素を取得
    const nextPageElem = await currentPageElem.getProperty(
      "nextElementSibling"
    );
    // 次のページへのリンクを取得
    const nextPageLink = await nextPageElem.asElement()?.$("a");

    // 次のページへのリンクがなくなったらスクレイピング終了
    if (!nextPageLink) {
      break;
    }

    // 次のページへ遷移
    await Promise.all([page.waitForNavigation(), nextPageLink.click()]);
  }

  await browser.close();

  return newArrivalList;
};

// 購読しているマンガのみを抽出する
export const filterNewArrivalList = (
  newArrivalList: NewArrival[]
): NewArrival[] => {
  return newArrivalList.filter((newArrivaldata) =>
    // 購読しているマンガのタイトルが新入荷のマンガのタイトルに含まれているかチェック
    mySubScriptionTitleList.some((title) =>
      newArrivaldata.mangaTitle?.includes(title)
    )
  );
};

// 新入荷リストをメール本文にフォーマット
export const formatNewArrivalListToMailText = (
  newArrivalList: NewArrival[]
): string => {
  if (!newArrivalList.length) {
    return "今月は購読しているマンガの新入荷はありません。";
  }

  return newArrivalList.reduce((previousValue, currentValue) => {
    return (
      previousValue + `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
    );
  }, "");
};

// 日付データ取得
export const getFormattedDate = () => {
  const japanLocaleString = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  return japanLocaleString;
};

// メールを送信
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
    text: `${storeName}}\n\n${mailBody}`,
  };

  await transporter.sendMail(mailOptions);
};

export const scrapeManga = functions
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .region("asia-northeast1")
  .pubsub.schedule("0 8 1 * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    try {
      // 今月の新入荷一覧を取得
      const newArrivalList = await execScrapingManga();
      // 新入荷一覧から購読しているマンガのみ抽出
      const filteredNewArrivalList = filterNewArrivalList(newArrivalList);
      // 新入荷情報をメールで送信
      await sendMail(formatNewArrivalListToMailText(filteredNewArrivalList));
    } catch (e: any) {
      console.error(e);
      if (e instanceof Error) {
        await sendMail(`An error occurred: ${e.message}`);
      } else {
        await sendMail(`An error occurred: ${JSON.stringify(e)}`);
      }
    }
  });
