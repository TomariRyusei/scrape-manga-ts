import { Manga } from "../entities/manga";

export interface IMangaService {
  filterMyManga(allManga: Manga[], myMangaList: string[]): Manga[];
  formatMangaForNotification(mangaList: Manga[]): string;
}

export class MangaService implements IMangaService {
  constructor(private storeName: string) {}
  filterMyManga(allManga: Manga[], myMangaList: string[]): Manga[] {
    return allManga.filter((manga) =>
      myMangaList.some((myManga) => manga.title.toLowerCase().includes(myManga.toLowerCase()))
    );
  }

  formatMangaForNotification(mangaList: Manga[]): string {
    const japanLocaleString = new Date().toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
    });

    let message = `${japanLocaleString} 新刊情報\n\n`;
    message += `【${this.storeName}】\n`;

    if (!mangaList.length) {
      return message + "今月は購読しているマンガの新入荷はありません。\n";
    }

    mangaList.forEach((manga) => {
      message += `${manga.releaseDate} ${manga.title}\n`;
    });

    return message;
  }
}
