export interface Asset {
  ticker: string,
  amount: number
  cost: number,
  mean_price: number,
  price: number | null,
  market_value?: number | null,
  unrealized_gain?: number | null,
  sector?: string,
  subsector?: string
}
