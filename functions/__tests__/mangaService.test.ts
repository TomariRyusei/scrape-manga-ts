import { MangaService } from "../src/domain/services/mangaService";
import { Manga } from "../src/domain/entities/manga";

describe("MangaService", () => {
  let mangaService: MangaService;
  let testMangaList: Manga[];

  beforeEach(() => {
    mangaService = new MangaService("快活クラブ 栄広小路店");

    testMangaList = [
      {
        title: "ワンピース 第100巻",
        releaseDate: "8/15",
      },
      {
        title: "鬼滅の刃 第23巻",
        releaseDate: "8/15",
      },
      {
        title: "ブルーロック 第20巻",
        releaseDate: "9/10",
      },
    ];
  });

  test("すべての新刊漫画リストから購読中の漫画をフィルタリングできること", () => {
    const myMangaList = ["ワンピース", "鬼滅の刃"];
    const filteredList = mangaService.filterMyManga(testMangaList, myMangaList);

    expect(filteredList.length).toBe(2);
    expect(filteredList[0].title).toContain("ワンピース");
    expect(filteredList[1].title).toContain("鬼滅の刃");
  });

  test("通知用メッセージを正しく生成できること", () => {
    const formattedMessage = mangaService.formatMangaForNotification(testMangaList);

    expect(formattedMessage).toContain("新刊情報");
    expect(formattedMessage).toContain("ワンピース 第100巻");
    expect(formattedMessage).toContain("8/15");
  });

  test("すべての新刊漫画リストに購読している漫画がない場合、空配列を返すこと", () => {
    const myMangaList = ["ダミー漫画1", "ダミー漫画2"];
    const filteredList = mangaService.filterMyManga(testMangaList, myMangaList);

    expect(filteredList.length).toBe(0);
  });

  test("購読している漫画の新着がない場合、正しいメッセージが生成できること", () => {
    const formattedMessage = mangaService.formatMangaForNotification([]);

    expect(formattedMessage).toContain("今月は購読しているマンガの新入荷はありません。");
  });
});
