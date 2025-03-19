import { Manga } from "../../domain/entities/manga";

export interface ScrapingPort {
  scrapeMangaList(url: string): Promise<Manga[]>;
}
