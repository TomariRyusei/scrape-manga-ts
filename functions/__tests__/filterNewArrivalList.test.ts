import {
  getSubscribingTitlesFromAllNewArrivals,
  NewArrival,
} from "../src/index";

describe("filterNewArrivalList", () => {
  const arrivalList: NewArrival[] = [
    { arrivalDate: "2022-04-22", mangaTitle: "おかえりアリス" },
    { arrivalDate: "2022-04-22", mangaTitle: "夏目アラタの結婚" },
    { arrivalDate: "2022-04-22", mangaTitle: "健康で文化的な最低限度の生活" },
    { arrivalDate: "2022-04-22", mangaTitle: "アオシマン" },
  ];

  it("should filter out non-subscribed manga titles", () => {
    const result = getSubscribingTitlesFromAllNewArrivals(arrivalList);
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
    const result = getSubscribingTitlesFromAllNewArrivals([
      { arrivalDate: "2022-04-22", mangaTitle: "アオシマン" },
      { arrivalDate: "2022-04-22", mangaTitle: "シンカリオン" },
    ]);
    expect(result).toHaveLength(0);
  });

  it("should return an empty array if the input array is empty", () => {
    const result = getSubscribingTitlesFromAllNewArrivals([]);
    expect(result).toHaveLength(0);
  });
});
