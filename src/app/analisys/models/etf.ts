export interface Etf {
    ticker: string;
    price: number;
    dy: number;
    expenseRatio: number;
    totalAssets: number;
    navPrice: number;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekHigh: number;
    averageVolume: number;
    mean_price?: number;
    to_buy?: number;
    to_equalize?: number;
}
