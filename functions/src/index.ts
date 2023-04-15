import * as functions from "firebase-functions";
import puppeteer from "puppeteer";
import * as nodemailer from "nodemailer";

import { mySubScriptionTitleList } from "./myMangaList";

const config = functions.config();

type NewArrivalList = {
  arrivalDate: string | null;
  mangaTitle: string | null;
}[];

const execScrapingManga = async (): Promise<NewArrivalList> => {
  // 全新入荷マンガ情報を格納する配列
  const newArrivalList: NewArrivalList = [];
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

  while (true) {
    // スクレイピング
    const newArrivalDL = await page.$("dl");
    if (newArrivalDL) {
      const newArrivalDT = await newArrivalDL.$$("dt");
      const newArrivalDD = await newArrivalDL.$$("dd");

      for (let i = 0; i < newArrivalDT.length; i++) {
        const arrivalDate = await (
          await newArrivalDT[i].getProperty("textContent")
        ).jsonValue();

        const ddTtile = await newArrivalDD[i].$("div.title");
        if (ddTtile) {
          const mangaTitle = await (
            await ddTtile.getProperty("textContent")
          ).jsonValue();

          // 入荷日とタイトルのみ取得してまとめる
          newArrivalList.push({
            arrivalDate: arrivalDate,
            mangaTitle: mangaTitle,
          });
        }
      }
    }

    // 配下にstrong要素を持つli要素 = 現在のページを示すページネーションを取得
    const [currentPageElem] = await page.$x(
      '//div[@id="list_footer"]/div/ul/li[strong]'
    );
    // 現在のページを示すページネーションの次のli要素を取得
    const nextPageElem = await currentPageElem.getProperty(
      "nextElementSibling"
    );
    // 次のページへのリンク
    const nextPageLink = await nextPageElem.asElement()?.$("a");

    // 次のページがなくなったらスクレイピング終了
    if (!nextPageLink) {
      break;
    }

    // 次のページへ遷移
    await Promise.all([page.waitForNavigation(), nextPageLink?.click()]);
  }

  await browser.close();

  return newArrivalList;
};

// 購読しているマンガのみを抽出する
const getFilterdNewArrivalList = (
  newArrivalList: NewArrivalList
): NewArrivalList => {
  return newArrivalList.filter((newArrivaldata) =>
    // 購読しているマンガのタイトルが新入荷のマンガのタイトルに含まれているかチェック
    mySubScriptionTitleList.some((title) =>
      newArrivaldata.mangaTitle?.includes(title)
    )
  );
};

// 新入荷リストをメール本文にフォーマット
const formatFilterdNewArrivalListToMailText = (
  newArrivalList: NewArrivalList
): string => {
  if (newArrivalList.length) {
    return newArrivalList.reduce((previousValue, currentValue) => {
      return (
        previousValue +
        `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
      );
    }, "快活クラブ 栄広小路店\n\n");
  } else {
    return "今月は購読しているマンガの入荷はありません。";
  }
};

// 日付データ取得
const getFormattedDate = () => {
  const japanLocaleString = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  return japanLocaleString;
};

// メールを送信
const sendMail = async (newArrivalMailText: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmail.email_address,
      pass: config.gmail.password,
    },
  });

  const mailOptions = {
    from: "マンガ新刊情報通知サービス(By Ryusei Tomari)",
    to: "t.ryu6635@gmail.com",
    subject: `${getFormattedDate()}の新刊入荷情報`,
    text: newArrivalMailText,
  };

  await transporter.sendMail(mailOptions);
};

export const scrapeManga = functions
  .runWith({ timeoutSeconds: 300, memory: "1GB" })
  .region("asia-northeast1")
  .pubsub.schedule("*/5 * * * *")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    // 今月の新入荷一覧を取得
    const newArrivalList = await execScrapingManga();
    // 新入荷一覧から購読しているマンガのみ抽出
    const filteredNewArrivalList = getFilterdNewArrivalList(newArrivalList);
    // 新入荷情報をメールで送信
    sendMail(formatFilterdNewArrivalListToMailText(filteredNewArrivalList));
  });
