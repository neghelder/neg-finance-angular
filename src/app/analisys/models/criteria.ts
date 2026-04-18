export interface FieldCriteria {
  min?: number;
  max?: number;
  unit: string;
}

export interface CriteriaConfig {
  [assetType: string]: {
    [origin: string]: {
      [field: string]: FieldCriteria;
    }
  }
}

export const FIELD_LABELS: Record<string, string> = {
  pl: 'P/L',
  pvp: 'P/VP',
  dy: 'DY',
  lpa: 'LPA',
  mrgebit: 'Marg. EBIT',
  mrgliq: 'Marg. Liq.',
  roe: 'ROE',
  cl5y: 'CL5Y',
  liqday: 'Liq. Diária',
  cd3y: 'CD3Y',
  c3y: 'C3Y',
  market_value: 'Market Value',
  patr: 'Patr.',
  shareholders: 'Shareholders'
};
