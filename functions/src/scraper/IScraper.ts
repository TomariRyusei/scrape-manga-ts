import { NewArrival } from "../type";

export interface IScraper {
  readonly storeName: string;
  readonly url: string;
  readonly newArrivals: NewArrival[];
  execute(): Promise<void>;
}
