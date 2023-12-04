import { NewArrival } from "../type";

export const getSubscribingNewArrivals = (
  newArrivals: NewArrival[],
  subscriptionList: string[]
): NewArrival[] => {
  return newArrivals.filter((newArrival) =>
    subscriptionList.some((title) => newArrival.mangaTitle?.includes(title))
  );
};
