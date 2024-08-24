export interface Note {
  id?: number,
  ticker: string,
  date: string,
  op: string,
  qtd: number,
  price: number,
  total_rat: number,
  total_cost?: number,
  rat?: number,
  net_price?: number,
  amount?: number,
  mean_price?: number,
  gain_miss?: number,
  taxes_month?: number,    
  ref_month?: string,
  sells_month?: number
}

export interface BrokerageCollection {
  name: string,
  notes: Note[]
}