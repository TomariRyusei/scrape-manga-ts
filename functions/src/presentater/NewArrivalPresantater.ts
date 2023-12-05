import { NewArrival } from "../type";
import { subscriptionList } from "../constants/subscriptionList";

export class NewArrivalPresantater {
  constructor(private newArrivals: NewArrival[], private storeName: string) {}

  format(): string {
    const subscribingNewArrivals = this.getSubscribingNewArrivals();
    return this.formatSubscribingNewArrivalsForMessage(subscribingNewArrivals);
  }

  private getSubscribingNewArrivals(): NewArrival[] {
    return this.newArrivals.filter((newArrival) =>
      subscriptionList.some((title) => newArrival.mangaTitle?.includes(title))
    );
  }

  private formatSubscribingNewArrivalsForMessage(
    subscribingNewArrivals: NewArrival[]
  ): string {
    if (!subscribingNewArrivals.length) {
      return `${this.storeName}\n\n今月は購読しているマンガの新入荷はありません。`;
    }

    return subscribingNewArrivals.reduce((previousValue, currentValue) => {
      return (
        previousValue +
        `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
      );
    }, `${this.storeName}\n`);
  }
}
