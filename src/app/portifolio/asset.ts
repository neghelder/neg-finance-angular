export interface Asset {
  ticker: string,
  amount: number
  cost: number,
  mean_price: number,
  price: number,
  market_value?: number,
  unrealized_gain?: number,
  sector?: string,
  subsector?: string
}