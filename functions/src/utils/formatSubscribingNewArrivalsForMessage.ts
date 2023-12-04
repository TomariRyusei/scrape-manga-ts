import { NewArrival } from "../type";

export const formatSubscribingNewArrivalsForMessage = (
  storeName: string,
  newArrivals: NewArrival[]
): string => {
  if (!newArrivals.length) {
    return `${storeName}\n\n今月は購読しているマンガの新入荷はありません。`;
  }

  return newArrivals.reduce((previousValue, currentValue) => {
    return (
      previousValue + `${currentValue.arrivalDate} ${currentValue.mangaTitle}\n`
    );
  }, `${storeName}\n`);
};
