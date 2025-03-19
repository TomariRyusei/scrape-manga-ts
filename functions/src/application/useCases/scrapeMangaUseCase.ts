import { IMangaService } from "../../domain/services/mangaService";
import { ScrapingPort } from "../ports/scrapingPort";
import { NotificationPort } from "../ports/notificationPort";

export class ScrapeMangaUseCase {
  constructor(
    private mangaService: IMangaService,
    private scrapingAdapter: ScrapingPort,
    private notificationAdapter: NotificationPort,
    private myMangaList: string[],
    private scrapingUrl: string
  ) {}

  async execute(): Promise<void> {
    try {
      // 1. スクレイピングで新刊情報を取得
      const allManga = await this.scrapingAdapter.scrapeMangaList(this.scrapingUrl);

      // 2. 自分の読んでいる漫画のみをフィルタリング
      const myNewManga = this.mangaService.filterMyManga(allManga, this.myMangaList);

      // 3. 通知用のメッセージ作成
      const message = this.mangaService.formatMangaForNotification(myNewManga);

      // 4. 通知を送信
      await this.notificationAdapter.sendNotification(message);
    } catch (error) {
      console.error("Error in ScrapeMangaUseCase:", error);
      throw error;
    }
  }
}
