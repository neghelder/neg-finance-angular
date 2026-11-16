import { IncomeTaxAsset } from './income-tax';

export function assetFixture(overrides: Partial<IncomeTaxAsset> = {}): IncomeTaxAsset {
  return {
    calendar_year: 2025, filing_year: 2026, previous_date: '31/12/2024', current_date: '31/12/2025',
    is_preview: false, category_code: 'BR_SHARES', market_code: 'BR', asset_type_code: 'SHARE', currency_code: 'BRL',
    ticker: 'TEST3', name: 'Companhia teste', metadata_source: 'nome_pregao', cnpj: '00.000.000/0001-00', cnpj_applicable: true,
    group: '03', code: '01', classification_reference: 'Exercício 2026',
    previous: { quantity: null, average_price: null, native_cost: null, fiscal_brl: null, source_date: null, source_id: null },
    current: { quantity: 1.125, average_price: 12.12345678, native_cost: 13.64, fiscal_brl: 13.64, source_date: '10/03/2025', source_id: 0 },
    description: '1,125 ações de TEST3.', issues: [{ code: 'NO_RECORDED_POSITION', message: 'Sem posição registrada nessa data.', reference_date: '31/12/2024' }],
    ...overrides
  };
}
