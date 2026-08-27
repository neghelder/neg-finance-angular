export interface FiagroConcentrationRisk {
  maior_devedor_pct_pl: string;
  detalhes_devedores: string;
  nivel_risco_concentracao: 'BAIXO' | 'MODERADO' | 'ELEVADO';
}

export interface FiagroAiAnalysis {
  ticker: string;
  nome_fundo?: string;
  data_referencia?: string;
  resumo_geral?: string;
  risco_concentracao?: FiagroConcentrationRisk;
  remuneracao_carteira?: string;
  inadimplencia_pct?: string;
  pontos_fortes?: string[];
  pontos_fracos?: string[];
  nota_recomendacao?: number;
  recomendacao?: 'COMPRAR' | 'NEUTRO' | 'EVITAR';
  justificativa_final?: string;
  error?: string;
}

export interface FiagroReportResult {
  ticker: string;
  market_indicators: Record<string, any>;
  cvm_regulatory_indicators?: Record<string, any>;
  ai_analysis: FiagroAiAnalysis;
}

export interface FiagroReportsResponse {
  status: string;
  eligible_count: number;
  timestamp?: string;
  message?: string;
  results: FiagroReportResult[];
}
