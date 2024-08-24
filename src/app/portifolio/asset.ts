export interface Asset {
  ticker: string,
  amount: number
  cost: number,
  mean_price: number,
  price: number,
  total_mkt_price?: number,
  unrealized_gain?: number,
  sector?: string,
  subsector?: string
}