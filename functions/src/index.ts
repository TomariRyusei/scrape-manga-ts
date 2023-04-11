import * as functions from "firebase-functions";
import { myMangaList } from "./myMangaList";

export const scrapeManga = functions.https.onRequest((request, response) => {
  functions.logger.info(myMangaList[0], { structuredData: true });
  response.send(myMangaList[1]);
});
