import { IncomeTaxAsset } from './income-tax';

export function metadataLabel(source: string | null): string {
  if (!source) { return 'Indisponível'; }
  if (source.endsWith('nome_pregao')) { return 'Nome de negociação do cadastro local; pode diferir da razão social'; }
  if (source.endsWith('descricao_fundo')) { return 'Descrição do fundo no cadastro local'; }
  return 'Cadastro local';
}

export function formatNumber(value: number | null, digits = 8): string {
  return value === null ? 'Indisponível' : value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits === 2 ? 2 : 0,
    maximumFractionDigits: digits,
    useGrouping: false
  });
}

export function assetCells(asset: IncomeTaxAsset): string[] {
  return [
    String(asset.calendar_year), String(asset.filing_year), asset.is_preview ? 'Prévia' : 'Ano encerrado',
    asset.category_code, asset.market_code, asset.asset_type_code, asset.currency_code,
    asset.ticker, asset.name ?? 'Indisponível', metadataLabel(asset.metadata_source),
    asset.cnpj_applicable ? (asset.cnpj ?? 'Indisponível') : 'Não se aplica',
    asset.group ?? 'Indisponível', asset.code ?? 'Indisponível', asset.classification_reference,
    ...[asset.previous, asset.current].flatMap((position, index) => [
      index === 0 ? asset.previous_date : asset.current_date,
      formatNumber(position.quantity, 20), formatNumber(position.average_price),
      formatNumber(position.native_cost, 2), formatNumber(position.fiscal_brl, 2),
      position.source_date ?? 'Indisponível', position.source_id === null ? 'Indisponível' : String(position.source_id)
    ]),
    asset.description,
    asset.issues.map(issue => `${issue.code}${issue.reference_date ? ` (${issue.reference_date})` : ''}: ${issue.message}`).join(' | ')
  ];
}

export const CSV_HEADERS = [
  'Ano-calendário', 'Exercício', 'Status', 'Categoria', 'Mercado', 'Classe', 'Moeda', 'Ticker', 'Nome',
  'Origem do nome', 'CNPJ', 'Grupo', 'Código', 'Referência da classificação',
  ...['Anterior', 'Atual'].flatMap(label => [
    `Data ${label}`, `Quantidade ${label}`, `Preço médio ${label} (moeda original)`,
    `Custo ${label} (moeda original)`, `Situação ${label} (BRL)`, `Registro ${label} (data)`, `Registro ${label} (ID)`
  ]),
  'Discriminação', 'Pendências'
];

function escapeCell(value: string): string {
  // Spreadsheet applications must treat catalogue/description values as text.
  const safe = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function assetsCsv(assets: IncomeTaxAsset[]): string {
  return '\uFEFF' + [CSV_HEADERS, ...assets.map(assetCells)]
    .map(row => row.map(escapeCell).join(';')).join('\r\n');
}

export function assetText(asset: IncomeTaxAsset): string {
  return assetCells(asset).map((value, index) => `${CSV_HEADERS[index]}: ${value}`).join('\n');
}
