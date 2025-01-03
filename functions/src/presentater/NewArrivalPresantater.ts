import { NewArrival } from "../type";
import { subscriptionList } from "../constants/subscriptionList";
import { IScraper } from "../scraper/IScraper";

export class NewArrivalPresantater {
  constructor(private scraper: IScraper) {}

  format(): string {
    const subscribingNewArrivals = this.getSubscribingNewArrivals();
    return this.formatSubscribingNewArrivalsForMessage(subscribingNewArrivals);
  }

  private getSubscribingNewArrivals(): NewArrival[] {
    return this.scraper.newArrivals.filter((newArrival) =>
      subscriptionList.some((title) => newArrival.mangaTitle?.includes(title))
    );
  }

  private formatSubscribingNewArrivalsForMessage(
    subscribingNewArrivals: NewArrival[]
  ): string {
    if (!subscribingNewArrivals.length) {
      return `【${this.scraper.storeName}】\n今月は購読しているマンガの新入荷はありません。`;
    }

    return subscribingNewArrivals.reduce((previousValue, currentValue) => {
      return (
        previousValue +
        `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
      );
    }, `【${this.scraper.storeName}】\n`);
  }
}
