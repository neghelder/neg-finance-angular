export interface AssetMarket {
  code: string;
  label: string;
  currency_code: string;
  active: boolean;
}

export interface AssetType {
  code: string;
  label: string;
  collection_suffix: string;
}

export interface AssetCategory {
  code: string;
  market_code: string;
  asset_type_code: string;
  label: string;
  active: boolean;
  currency_code: string;
  capabilities: string[];
  brokerage_state: 'available' | 'enabled' | 'archived';
  archived: boolean;
}
