import {
  getSubscribingTitlesFromAllNewArrivals,
  NewArrival,
} from "../src/index";

import { mySubscriptionListForTest } from "./mySubscriptionListForTest";

describe("filterNewArrivalList", () => {
  const arrivalList: NewArrival[] = [
    { arrivalDate: "2022-04-22", mangaTitle: "九条の大罪" },
    { arrivalDate: "2022-04-22", mangaTitle: "イリオス" },
    { arrivalDate: "2022-04-22", mangaTitle: "健康で文化的な最低限度の生活" },
    { arrivalDate: "2022-04-22", mangaTitle: "アオシマン" },
  ];

  it("should filter out non-subscribed manga titles", () => {
    const result = getSubscribingTitlesFromAllNewArrivals(
      arrivalList,
      mySubscriptionListForTest
    );
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({
      arrivalDate: "2022-04-22",
      mangaTitle: "九条の大罪",
    });
    expect(result).toContainEqual({
      arrivalDate: "2022-04-22",
      mangaTitle: "イリオス",
    });
    expect(result).toContainEqual({
      arrivalDate: "2022-04-22",
      mangaTitle: "健康で文化的な最低限度の生活",
    });
  });

  it("should return an empty array if all manga titles are non-subscribed", () => {
    const result = getSubscribingTitlesFromAllNewArrivals(
      [
        { arrivalDate: "2022-04-22", mangaTitle: "アオシマン" },
        { arrivalDate: "2022-04-22", mangaTitle: "シンカリオン" },
      ],
      mySubscriptionListForTest
    );
    expect(result).toHaveLength(0);
  });

  it("should return an empty array if the input array is empty", () => {
    const result = getSubscribingTitlesFromAllNewArrivals(
      [],
      mySubscriptionListForTest
    );
    expect(result).toHaveLength(0);
  });
});
