export interface IncomeTaxPosition {
  quantity: number | null;
  average_price: number | null;
  native_cost: number | null;
  fiscal_brl: number | null;
  source_date: string | null;
  source_id: number | null;
}

export interface IncomeTaxAsset {
  calendar_year: number;
  filing_year: number;
  previous_date: string;
  current_date: string;
  is_preview: boolean;
  category_code: string;
  market_code: string;
  asset_type_code: string;
  currency_code: string;
  ticker: string;
  name: string | null;
  metadata_source: string | null;
  cnpj: string | null;
  cnpj_applicable: boolean;
  group: string | null;
  code: string | null;
  classification_reference: string;
  previous: IncomeTaxPosition;
  current: IncomeTaxPosition;
  description: string;
  issues: { code: string; message: string; reference_date: string | null }[];
}
