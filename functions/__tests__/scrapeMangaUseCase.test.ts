import { ScrapeMangaUseCase } from "../src/application/useCases/scrapeMangaUseCase";
import { IMangaService } from "../src/domain/services/mangaService";
import { ScrapingPort } from "../src/application/ports/scrapingPort";
import { NotificationPort } from "../src/application/ports/notificationPort";
import { Manga } from "../src/domain/entities/manga";

jest.mock("../src/domain/services/mangaService");
jest.mock("../src/application/ports/scrapingPort");
jest.mock("../src/application/ports/notificationPort");

describe("ScrapeMangaUseCase", () => {
  let scrapeMangaUseCase: ScrapeMangaUseCase;
  let mockMangaService: jest.Mocked<IMangaService>;
  let mockScrapingAdapter: jest.Mocked<ScrapingPort>;
  let mockNotificationAdapter: jest.Mocked<NotificationPort>;
  let myMangaList: string[];
  let scrapingUrl: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockMangaService = {
      filterMyManga: jest.fn(),
      formatMangaForNotification: jest.fn(),
    } as jest.Mocked<IMangaService>;

    mockScrapingAdapter = {
      scrapeMangaList: jest.fn(),
    } as jest.Mocked<ScrapingPort>;

    mockNotificationAdapter = {
      sendNotification: jest.fn(),
    } as jest.Mocked<NotificationPort>;

    myMangaList = ["鬼滅の刃", "ワンピース", "ナルト"];
    scrapingUrl = "https://example.com/new-manga";

    scrapeMangaUseCase = new ScrapeMangaUseCase(
      mockMangaService,
      mockScrapingAdapter,
      mockNotificationAdapter,
      myMangaList,
      scrapingUrl
    );
  });

  test("execute メソッドが正常に全ての処理を実行すること", async () => {
    const allManga: Manga[] = [
      { title: "鬼滅の刃", releaseDate: "2023-05-01" },
      { title: "ワンピース", releaseDate: "2023-05-02" },
      { title: "ブラッククローバー", releaseDate: "2023-05-03" },
    ] as Manga[];

    const myNewManga: Manga[] = [
      { title: "鬼滅の刃", releaseDate: "2023-05-01" },
      { title: "ワンピース", releaseDate: "2023-05-02" },
    ] as Manga[];

    const notificationMessage = "新刊情報:\n鬼滅の刃 23巻 (2023-05-01)\nワンピース 104巻 (2023-05-02)";

    mockScrapingAdapter.scrapeMangaList.mockResolvedValue(allManga);
    mockMangaService.filterMyManga.mockReturnValue(myNewManga);
    mockMangaService.formatMangaForNotification.mockReturnValue(notificationMessage);
    mockNotificationAdapter.sendNotification.mockResolvedValue(undefined);

    await scrapeMangaUseCase.execute();

    expect(mockScrapingAdapter.scrapeMangaList).toHaveBeenCalledWith(scrapingUrl);
    expect(mockMangaService.filterMyManga).toHaveBeenCalledWith(allManga, myMangaList);
    expect(mockMangaService.formatMangaForNotification).toHaveBeenCalledWith(myNewManga);
    expect(mockNotificationAdapter.sendNotification).toHaveBeenCalledWith(notificationMessage);
  });

  test("スクレイピングでエラーが発生した場合、エラーがスローされること", async () => {
    const error = new Error("スクレイピングに失敗しました");

    mockScrapingAdapter.scrapeMangaList.mockRejectedValue(error);

    await expect(scrapeMangaUseCase.execute()).rejects.toThrow("スクレイピングに失敗しました");

    expect(mockScrapingAdapter.scrapeMangaList).toHaveBeenCalledWith(scrapingUrl);
    expect(mockMangaService.filterMyManga).not.toHaveBeenCalled();
    expect(mockMangaService.formatMangaForNotification).not.toHaveBeenCalled();
    expect(mockNotificationAdapter.sendNotification).not.toHaveBeenCalled();
  });

  test("通知でエラーが発生した場合、エラーがスローされること", async () => {
    const allManga: Manga[] = [{ title: "鬼滅の刃", releaseDate: "2023-05-01" }] as Manga[];

    const myNewManga: Manga[] = [{ title: "鬼滅の刃", releaseDate: "2023-05-01" }] as Manga[];

    const notificationMessage = "新刊情報:\n鬼滅の刃 23巻 (2023-05-01)";
    const error = new Error("通知の送信に失敗しました");

    mockScrapingAdapter.scrapeMangaList.mockResolvedValue(allManga);
    mockMangaService.filterMyManga.mockReturnValue(myNewManga);
    mockMangaService.formatMangaForNotification.mockReturnValue(notificationMessage);
    mockNotificationAdapter.sendNotification.mockRejectedValue(error);

    await expect(scrapeMangaUseCase.execute()).rejects.toThrow("通知の送信に失敗しました");

    expect(mockScrapingAdapter.scrapeMangaList).toHaveBeenCalledWith(scrapingUrl);
    expect(mockMangaService.filterMyManga).toHaveBeenCalledWith(allManga, myMangaList);
    expect(mockMangaService.formatMangaForNotification).toHaveBeenCalledWith(myNewManga);
    expect(mockNotificationAdapter.sendNotification).toHaveBeenCalledWith(notificationMessage);
  });

  test("新刊がない場合でも正常に処理が完了すること", async () => {
    // テストデータを準備
    const allManga: Manga[] = [{ title: "ブラッククローバー", releaseDate: "2023-05-03" }] as Manga[];

    const myNewManga: Manga[] = []; // 自分の漫画リストに該当するものがない
    const notificationMessage = "新刊はありません";

    mockScrapingAdapter.scrapeMangaList.mockResolvedValue(allManga);
    mockMangaService.filterMyManga.mockReturnValue(myNewManga);
    mockMangaService.formatMangaForNotification.mockReturnValue(notificationMessage);
    mockNotificationAdapter.sendNotification.mockResolvedValue(undefined);

    await scrapeMangaUseCase.execute();

    expect(mockScrapingAdapter.scrapeMangaList).toHaveBeenCalledWith(scrapingUrl);
    expect(mockMangaService.filterMyManga).toHaveBeenCalledWith(allManga, myMangaList);
    expect(mockMangaService.formatMangaForNotification).toHaveBeenCalledWith(myNewManga);
    expect(mockNotificationAdapter.sendNotification).toHaveBeenCalledWith(notificationMessage);
  });
});
