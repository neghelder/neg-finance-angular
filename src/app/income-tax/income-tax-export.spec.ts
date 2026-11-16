import { assetCells, assetsCsv, assetText, CSV_HEADERS, formatNumber, metadataLabel } from './income-tax-export';
import { assetFixture } from './income-tax.fixture';

describe('income tax text and CSV export', () => {
  it('explains local metadata provenance without exposing paths as product labels', () => {
    expect(metadataLabel(null)).toBe('Indisponível');
    expect(metadataLabel('report_asset_mappings.json:STOCK:TEST3:nome_pregao')).toContain('pode diferir da razão social');
    expect(metadataLabel('report_asset_mappings.json:FII:TEST11:descricao_fundo')).toBe('Descrição do fundo no cadastro local');
    expect(metadataLabel('local')).toBe('Cadastro local');
  });
  it('distinguishes unavailable fields and zero and retains fractions and average precision', () => {
    expect(formatNumber(null)).toBe('Indisponível');
    expect(formatNumber(0, 2)).toBe('0,00');
    expect(formatNumber(1.125, 20)).toBe('1,125');
    expect(formatNumber(12.12345678)).toBe('12,12345678');
    const cells = assetCells(assetFixture());
    expect(cells).toHaveLength(CSV_HEADERS.length);
    expect(cells).toContain('13,64');
    expect(cells).toContain('0'); // source ID zero is not unavailable
  });

  it('uses BOM, semicolons, explicit dates/currency and escaped quotes and multiline text', () => {
    const csv = assetsCsv([assetFixture({ description: 'Linha 1; "nome"\nLinha 2' })]);
    expect(csv.startsWith('\uFEFF"Ano-calendário";"Exercício"')).toBe(true);
    expect(csv).toContain('"Linha 1; ""nome""\nLinha 2"');
    expect(csv).toContain('"31/12/2024"');
    expect(csv).toContain('"BRL"');
    expect(csv).toContain('NO_RECORDED_POSITION (31/12/2024)');
  });

  it('exports foreign native costs without inventing a BRL value or CNPJ', () => {
    const row = assetFixture({ cnpj_applicable: false, currency_code: 'USD', current: {
      quantity: 2.5, average_price: 10, native_cost: 25, fiscal_brl: null, source_date: '01/03/2025', source_id: 2
    }});
    const text = assetText(row);
    expect(text).toContain('CNPJ: Não se aplica');
    expect(text).toContain('Custo Atual (moeda original): 25,00');
    expect(text).toContain('Situação Atual (BRL): Indisponível');
    expect(text).toContain('Moeda: USD');
  });

  it('protects spreadsheet formula cells while preserving ordinary text', () => {
    expect(assetsCsv([assetFixture({ name: '=HYPERLINK("x")' })])).toContain('"\'=HYPERLINK(""x"")"');
    expect(assetsCsv([]).split('\r\n')).toHaveLength(1);
  });
});
