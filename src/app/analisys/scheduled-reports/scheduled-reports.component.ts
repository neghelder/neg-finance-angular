import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, forkJoin, of, Subscription, switchMap, timer } from 'rxjs';
import { AnalisysService } from '../analisys.service';
import {
  JsonValue,
  ReportAssetType,
  ReportAutomationAssets,
  ReportAutomationRun,
  ReportAutomationRunRequest,
  ReportAutomationStatus,
  ScheduledReportSnapshot
} from '../models/scheduled-report';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

interface ReportDetailRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-scheduled-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, LoadingBarComponent],
  templateUrl: './scheduled-reports.component.html',
  styleUrl: './scheduled-reports.component.scss'
})
export class ScheduledReportsComponent implements OnChanges, OnDestroy {
  @Input() assetType: ReportAssetType | null = null;

  isLoading = false;
  errorMessage: string | null = null;
  reports: ScheduledReportSnapshot[] = [];
  automationStatus: ReportAutomationStatus | null = null;
  selectedHistory: ScheduledReportSnapshot[] = [];
  selectedHistoryReport: ScheduledReportSnapshot | null = null;
  selectedTicker: string | null = null;
  historyError: string | null = null;
  historyLoading = false;
  tickerSearch = '';
  selectedTickers = new Set<string>();

  supportedAssets: ReportAutomationAssets | null = null;
  manualTickerSearch = '';
  manualSelectedTickers = new Set<string>();
  forceReprocess = false;
  forceReprocessConfirmationRequired = false;
  manualSubmitting = false;
  manualError: string | null = null;
  manualSuccess: string | null = null;
  activeManualRun: ReportAutomationRun | null = null;
  private runPolling: Subscription | null = null;

  private readonly pollIntervalMs = 3_000;

  constructor(private readonly analysisService: AnalisysService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['assetType']) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.stopRunPolling();
  }

  load(): void {
    if (!this.assetType) {
      this.reset();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.reports = [];
    this.tickerSearch = '';
    this.selectedTickers.clear();
    this.resetManualRequest();
    this.stopRunPolling();
    this.closeHistory();

    forkJoin({
      reports: this.analysisService.getScheduledReports(this.assetType),
      status: this.analysisService.getReportAutomationStatus(),
      assets: this.analysisService.getReportAutomationAssets(this.assetType)
    }).subscribe({
      next: ({ reports, status, assets }) => {
        this.reports = this.latestReportPerAsset(reports);
        this.automationStatus = status;
        this.supportedAssets = this.normalizedAssets(assets);
        this.recoverActiveRun(status);
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.reports = [];
        this.automationStatus = null;
        this.supportedAssets = null;
        this.errorMessage = this.errorText(error, 'Não foi possível carregar os relatórios agendados.');
        this.isLoading = false;
      }
    });
  }

  showHistory(report: ScheduledReportSnapshot): void {
    this.selectedTicker = report.ticker;
    this.selectedHistory = [];
    this.selectedHistoryReport = null;
    this.historyError = null;
    this.historyLoading = true;

    this.analysisService.getScheduledReportHistory(report.asset_type, report.ticker).subscribe({
      next: history => {
        this.selectedHistory = [...history].sort((left, right) => this.timestamp(right.created_at) - this.timestamp(left.created_at));
        this.selectedHistoryReport = this.selectedHistory[0] ?? null;
        this.historyLoading = false;
      },
      error: (error: unknown) => {
        this.historyError = this.errorText(error, 'Não foi possível carregar o histórico deste ativo.');
        this.historyLoading = false;
      }
    });
  }

  selectHistorySnapshot(report: ScheduledReportSnapshot): void {
    this.selectedHistoryReport = report;
  }

  get visibleReports(): ScheduledReportSnapshot[] {
    return this.reports.filter(report => this.selectedTickers.has(report.ticker));
  }

  get filteredTickers(): string[] {
    const search = this.tickerSearch.trim().toUpperCase();
    return this.reports
      .map(report => report.ticker)
      .filter(ticker => !search || ticker.toUpperCase().includes(search))
      .sort((left, right) => left.localeCompare(right));
  }

  setTickerSearch(value: string): void {
    this.tickerSearch = value;
  }

  setTickerSelected(ticker: string, selected: boolean): void {
    if (selected) {
      this.selectedTickers.add(ticker);
      return;
    }

    this.selectedTickers.delete(ticker);
    if (this.selectedTicker === ticker) this.closeHistory();
  }

  selectFilteredTickers(): void {
    this.filteredTickers.forEach(ticker => this.selectedTickers.add(ticker));
  }

  clearTickerSelection(): void {
    this.selectedTickers.clear();
    this.closeHistory();
  }

  isTickerSelected(ticker: string): boolean {
    return this.selectedTickers.has(ticker);
  }

  get filteredManualTickers(): string[] {
    const search = this.manualTickerSearch.trim().toUpperCase();
    return (this.supportedAssets?.tickers ?? [])
      .filter(ticker => !search || ticker.toUpperCase().includes(search))
      .sort((left, right) => left.localeCompare(right));
  }

  get maxManualJobs(): number {
    return this.supportedAssets?.max_jobs_per_run ?? 0;
  }

  get isAutomationRuntimeAvailable(): boolean {
    const runtime = this.automationStatus?.runtime;
    return !runtime || (runtime.codex_available && runtime.auth_available);
  }

  get automationRuntimeMessage(): string | null {
    const runtime = this.automationStatus?.runtime;
    if (!runtime) return null;
    if (!runtime.codex_available) return 'O Codex CLI não está disponível. Instale ou exponha o runtime antes de solicitar um relatório.';
    if (!runtime.auth_available) return 'A autenticação do Codex não está disponível. Faça login no Codex antes de solicitar um relatório.';
    return null;
  }

  get isManualRunActive(): boolean {
    return this.activeManualRun !== null && !this.isTerminalRunStatus(this.activeManualRun.status);
  }

  get canRetryManualRun(): boolean {
    if (!this.activeManualRun || this.isManualRunActive) return false;
    return this.activeManualRun.status === 'PARTIAL' || this.activeManualRun.status === 'FAILED';
  }

  get manualJobEntries(): Array<{ status: string; count: number }> {
    return Object.entries(this.activeManualRun?.jobs ?? {})
      .map(([status, count]) => ({ status, count }))
      .sort((left, right) => left.status.localeCompare(right.status));
  }

  manualRunTickerStatus(ticker: string): string {
    const run = this.activeManualRun;
    if (!run) return 'QUEUED';
    const item = (run.items ?? []).find(candidate => candidate.ticker.toUpperCase() === ticker.toUpperCase());
    if (item) return item.status;
    const error = run.errors.find(item => item.ticker.toUpperCase() === ticker.toUpperCase());
    if (error) return error.status || 'FAILED';
    const diagnostic = run.diagnostics.find(item => item.ticker?.toUpperCase() === ticker.toUpperCase());
    return diagnostic?.reason ?? run.status;
  }

  runStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      QUEUED: 'Na fila',
      PREPARING: 'Preparando',
      ANALYZING: 'Analisando',
      FINALIZING: 'Finalizando',
      FINALIZED: 'Concluído',
      UP_TO_DATE: 'Já atualizado',
      PARTIAL: 'Concluído com falhas',
      FAILED: 'Falhou'
    };
    return labels[status.toUpperCase()] ?? status;
  }

  setManualTickerSearch(value: string): void {
    this.manualTickerSearch = value;
  }

  isManualTickerSelected(ticker: string): boolean {
    return this.manualSelectedTickers.has(ticker);
  }

  setManualTickerSelected(ticker: string, selected: boolean): void {
    this.manualError = null;
    if (!selected) {
      this.manualSelectedTickers.delete(ticker);
      return;
    }
    if (this.manualSelectedTickers.has(ticker)) return;
    if (this.manualSelectedTickers.size >= this.maxManualJobs) {
      this.manualError = `Selecione no máximo ${this.maxManualJobs} ativo(s) por solicitação.`;
      return;
    }
    this.manualSelectedTickers.add(ticker);
  }

  selectFilteredManualTickers(): void {
    this.manualError = null;
    const available = this.maxManualJobs - this.manualSelectedTickers.size;
    if (available <= 0) {
      this.manualError = `Selecione no máximo ${this.maxManualJobs} ativo(s) por solicitação.`;
      return;
    }
    const selected = this.filteredManualTickers.filter(ticker => !this.manualSelectedTickers.has(ticker));
    selected.slice(0, available).forEach(ticker => this.manualSelectedTickers.add(ticker));
    if (selected.length > available) {
      this.manualError = `Foram selecionados os primeiros ${available} ativo(s), respeitando o limite de ${this.maxManualJobs}.`;
    }
  }

  clearManualTickerSelection(): void {
    this.manualSelectedTickers.clear();
    this.manualError = null;
  }

  requestManualRun(): void {
    this.manualError = null;
    this.manualSuccess = null;
    if (!this.assetType || this.manualSelectedTickers.size === 0) {
      this.manualError = 'Selecione ao menos um ativo para solicitar o relatório.';
      return;
    }
    if (!this.isAutomationRuntimeAvailable) {
      this.manualError = this.automationRuntimeMessage ?? 'A automação não está disponível no momento.';
      return;
    }
    if (this.forceReprocess && !this.forceReprocessConfirmationRequired) {
      this.forceReprocessConfirmationRequired = true;
      return;
    }
    this.createManualRun();
  }

  confirmForceReprocess(): void {
    this.forceReprocessConfirmationRequired = false;
    this.createManualRun();
  }

  cancelForceReprocess(): void {
    this.forceReprocessConfirmationRequired = false;
  }

  retryManualRun(): void {
    if (!this.activeManualRun || this.manualSubmitting) return;
    this.manualError = null;
    this.manualSuccess = null;
    this.manualSubmitting = true;
    this.analysisService.retryReportAutomationRun(this.activeManualRun.run_id).subscribe({
      next: run => {
        this.activeManualRun = this.normalizedRun(run);
        this.manualSubmitting = false;
        this.manualSuccess = 'Os ativos recuperáveis voltaram para a fila.';
        this.startRunPolling(this.activeManualRun.run_id);
      },
      error: (error: unknown) => {
        this.manualError = this.errorText(error, 'Não foi possível repetir os ativos com falha.');
        this.manualSubmitting = false;
      }
    });
  }

  closeHistory(): void {
    this.selectedTicker = null;
    this.selectedHistory = [];
    this.selectedHistoryReport = null;
    this.historyError = null;
    this.historyLoading = false;
  }

  labelClass(label: string | null | undefined): string {
    switch (label) {
      case 'COMPRAR': return 'label-buy';
      case 'EVITAR': return 'label-avoid';
      case 'NEUTRO': return 'label-neutral';
      default: return 'label-undetermined';
    }
  }

  qualitativeState(report: ScheduledReportSnapshot): string {
    if (report.partial_failure.is_partial || report.qualitative.status === 'FAILED') return 'Falha parcial';
    if (report.qualitative.status === 'PENDING' || report.freshness.status === 'PENDING') return 'Análise qualitativa em processamento';
    if (report.freshness.qualitative_status === 'STALE' || report.qualitative.status === 'STALE') return 'Qualitativo desatualizado';
    if (!report.qualitative.analysis_id || report.freshness.qualitative_status === 'MISSING') return 'Sem análise qualitativa';
    if (report.qualitative.status === 'INVALID') return 'Evidência qualitativa inválida';
    return 'Qualitativo atual';
  }

  sourceState(report: ScheduledReportSnapshot): string {
    if (report.conflicts.has_conflict) return 'Há versões conflitantes';
    if (report.freshness.source_revision_matches_analysis === false || report.freshness.status === 'STALE') return 'Análise desatualizada para o documento atual';
    if (report.freshness.status === 'FRESH') return 'Documento e análise atualizados';
    if (report.freshness.status === 'PENDING') return 'Análise em processamento';
    if (report.freshness.status === 'MISSING' || report.freshness.status === 'UNAVAILABLE' || !report.source) return 'Documento ou análise indisponível';
    return 'Situação da fonte indisponível';
  }

  hasPartialFailure(report: ScheduledReportSnapshot): boolean {
    return report.partial_failure.is_partial || report.qualitative.status === 'FAILED';
  }

  marketScoreTooltip(assetType: ReportAssetType): string {
    const factors = assetType === 'STOCK'
      ? 'P/L, ROE, P/VP e margem líquida.'
      : 'P/VP e dividend yield.';
    return `É a pontuação do ranking quantitativo da API, calculada com ${factors} A escala varia conforme o universo analisado; quanto maior, melhor.`;
  }

  rankTooltip(): string {
    return 'Posição do ativo entre os que passaram pelos critérios quantitativos, ordenados pela pontuação.';
  }

  cohortTooltip(): string {
    return 'Quantidade total de ativos usados como universo de comparação neste snapshot de mercado.';
  }

  detailTitle(assetType: ReportAssetType): string {
    switch (assetType) {
      case 'FII': return 'Detalhes qualitativos e CVM do FII';
      case 'FIAGRO': return 'Detalhes qualitativos e CVM do FIAGRO';
      case 'STOCK': return 'Detalhes qualitativos e CVM da ação';
    }
  }

  displayValue(value: JsonValue | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return 'Indisponível';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'number') return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 }).format(value);
    if (typeof value === 'string') {
      if (value === 'PASS') return 'Atende';
      if (value === 'FAIL') return 'Não atende';
      return value;
    }
    return Array.isArray(value) ? `${value.length} item(ns)` : `${Object.keys(value).length} campo(s)`;
  }

  detailRows(value: JsonValue | null | undefined): ReportDetailRow[] {
    const rows: ReportDetailRow[] = [];
    this.flattenDetails(value, [], rows);
    return rows;
  }

  evidenceRows(evidence: { page: number | null; [key: string]: JsonValue | undefined }): ReportDetailRow[] {
    const { page: _, ...details } = evidence;
    return this.detailRows(details as JsonValue);
  }

  qualitativeRows(report: ScheduledReportSnapshot): ReportDetailRow[] {
    const qualitative = report.details.qualitative;
    if (Array.isArray(qualitative)) {
      return JSON.stringify(qualitative) === JSON.stringify(report.qualitative.evidence)
        ? []
        : this.detailRows(qualitative);
    }
    if (qualitative !== null && typeof qualitative === 'object') {
      const summary = Object.fromEntries(
        Object.entries(qualitative).filter(([key]) => key !== 'evidence' && key !== 'page_evidence')
      );
      return Object.keys(summary).length ? this.detailRows(summary) : [];
    }
    return this.detailRows(qualitative);
  }

  jobEntries(): Array<{ status: string; count: number }> {
    return Object.entries(this.automationStatus?.jobs ?? {}).map(([status, count]) => ({ status, count }));
  }

  private latestReportPerAsset(reports: ScheduledReportSnapshot[]): ScheduledReportSnapshot[] {
    const latest = new Map<string, ScheduledReportSnapshot>();

    for (const report of reports) {
      const key = `${report.asset_type}:${report.ticker.toUpperCase()}`;
      const current = latest.get(key);
      if (!current || this.timestamp(report.created_at) > this.timestamp(current.created_at)) {
        latest.set(key, report);
      }
    }

    return Array.from(latest.values());
  }

  private createManualRun(): void {
    if (!this.assetType || this.manualSubmitting) return;
    const request: ReportAutomationRunRequest = {
      asset_type: this.assetType,
      tickers: Array.from(this.manualSelectedTickers),
      force_reprocess: this.forceReprocess
    };
    this.manualSubmitting = true;
    this.analysisService.createReportAutomationRun(request).subscribe({
      next: run => {
        this.activeManualRun = this.normalizedRun(run, request);
        this.manualSubmitting = false;
        this.forceReprocessConfirmationRequired = false;
        this.manualSuccess = 'Solicitação criada. O progresso será atualizado automaticamente.';
        this.startRunPolling(this.activeManualRun.run_id);
      },
      error: (error: unknown) => {
        this.manualError = this.errorText(error, 'Não foi possível solicitar os relatórios.');
        this.manualSubmitting = false;
      }
    });
  }

  private startRunPolling(runId: string): void {
    this.stopRunPolling();
    this.pollRun(runId);
    this.runPolling = timer(this.pollIntervalMs, this.pollIntervalMs).pipe(
      switchMap(() => this.analysisService.getReportAutomationRun(runId).pipe(
        catchError((error: unknown) => {
          this.manualError = this.errorText(error, 'Não foi possível atualizar o progresso da solicitação.');
          return of(null);
        })
      ))
    ).subscribe(run => {
      if (run) this.applyRunStatus(run);
    });
  }

  private pollRun(runId: string): void {
    this.analysisService.getReportAutomationRun(runId).subscribe({
      next: run => this.applyRunStatus(run),
      error: (error: unknown) => {
        this.manualError = this.errorText(error, 'Não foi possível atualizar o progresso da solicitação.');
      }
    });
  }

  private applyRunStatus(run: ReportAutomationRun): void {
    this.activeManualRun = this.normalizedRun(run, this.activeManualRun?.requested);
    if (!this.isTerminalRunStatus(this.activeManualRun.status)) return;
    this.stopRunPolling();
    this.manualSuccess = this.activeManualRun.status === 'FAILED'
      ? 'A solicitação terminou com falhas. Consulte os detalhes ou tente novamente os ativos recuperáveis.'
      : 'Solicitação concluída. Os relatórios foram atualizados.';
    this.refreshReportsAfterRun();
  }

  private refreshReportsAfterRun(): void {
    if (!this.assetType || !this.activeManualRun) return;
    const requestedTickers = new Set(this.activeManualRun.requested.tickers.map(ticker => ticker.toUpperCase()));
    forkJoin({
      reports: this.analysisService.getScheduledReports(this.assetType),
      status: this.analysisService.getReportAutomationStatus()
    }).subscribe({
      next: ({ reports, status }) => {
        this.reports = this.latestReportPerAsset(reports);
        this.automationStatus = status;
        this.reports
          .filter(report => requestedTickers.has(report.ticker.toUpperCase()))
          .forEach(report => this.selectedTickers.add(report.ticker));
      },
      error: (error: unknown) => {
        this.manualError = this.errorText(error, 'A solicitação foi concluída, mas não foi possível atualizar os relatórios exibidos.');
      }
    });
  }

  private recoverActiveRun(status: ReportAutomationStatus): void {
    const recovered = (status.manual_runs ?? [])
      .filter(run => run.requested?.asset_type === this.assetType && !this.isTerminalRunStatus(run.status))
      .sort((left, right) => this.timestamp(right.updated_at ?? right.created_at ?? '') - this.timestamp(left.updated_at ?? left.created_at ?? ''))[0];
    if (!recovered) return;
    this.activeManualRun = this.normalizedRun(recovered as ReportAutomationRun);
    this.startRunPolling(this.activeManualRun.run_id);
  }

  private normalizedAssets(assets: ReportAutomationAssets): ReportAutomationAssets {
    return {
      ...assets,
      tickers: Array.from(new Set(assets.tickers.map(ticker => ticker.trim().toUpperCase()).filter(Boolean))).sort((left, right) => left.localeCompare(right)),
      max_jobs_per_run: Math.max(1, assets.max_jobs_per_run)
    };
  }

  private normalizedRun(run: ReportAutomationRun, fallbackRequest?: ReportAutomationRunRequest): ReportAutomationRun {
    const request = run.requested ?? fallbackRequest ?? {
      asset_type: this.assetType ?? 'FII',
      tickers: [],
      force_reprocess: false
    };
    return {
      ...run,
      requested: request,
      items: run.items ?? [],
      jobs: run.jobs ?? {},
      diagnostics: run.diagnostics ?? [],
      errors: run.errors ?? []
    };
  }

  private isTerminalRunStatus(status: string): boolean {
    return ['FINALIZED', 'UP_TO_DATE', 'PARTIAL', 'FAILED'].includes(status.toUpperCase());
  }

  private stopRunPolling(): void {
    this.runPolling?.unsubscribe();
    this.runPolling = null;
  }

  private flattenDetails(value: JsonValue | undefined, path: string[], rows: ReportDetailRow[]): void {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ label: this.detailLabel(path), value: 'Nenhum item' });
        return;
      }

      if (value.every(item => item === null || typeof item !== 'object')) {
        rows.push({ label: this.detailLabel(path), value: value.map(item => this.displayValue(item)).join(', ') });
        return;
      }

      value.forEach((item, index) => this.flattenDetails(item, [...path, `item_${index + 1}`], rows));
      return;
    }

    if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        rows.push({ label: this.detailLabel(path), value: 'Nenhum dado disponível' });
        return;
      }

      entries.forEach(([key, child]) => this.flattenDetails(child, [...path, key], rows));
      return;
    }

    rows.push({ label: this.detailLabel(path), value: this.displayValue(value) });
  }

  private detailLabel(path: string[]): string {
    if (path.length === 0) return 'Valor';
    return path.map(part => this.humanizeKey(part)).join(' · ');
  }

  private humanizeKey(key: string): string {
    const labels: Record<string, string> = {
      c3y: 'Crescimento (3 anos)',
      cd3y: 'Crescimento de dividendos (3 anos)',
      cdy: 'Crescimento de dividendos',
      claim: 'Conclusão',
      confidence: 'Confiança',
      critical_risk: 'Risco crítico',
      dy: 'Dividend yield',
      liqday: 'Liquidez diária',
      market_value: 'Valor de mercado',
      patr: 'Patrimônio',
      pvp: 'P/VP',
      quality: 'Nota qualitativa (0–10)',
      shareholders: 'Cotistas',
      vacancy_financial_pct: 'Vacância financeira',
      vacancy_physical_pct: 'Vacância física'
    };
    if (labels[key]) return labels[key];
    const itemMatch = /^item_(\d+)$/.exec(key);
    if (itemMatch) return `Item ${itemMatch[1]}`;
    const words = key.replace(/_/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  private timestamp(value: string): number {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private reset(): void {
    this.isLoading = false;
    this.errorMessage = null;
    this.reports = [];
    this.automationStatus = null;
    this.tickerSearch = '';
    this.selectedTickers.clear();
    this.supportedAssets = null;
    this.resetManualRequest();
    this.stopRunPolling();
    this.closeHistory();
  }

  private resetManualRequest(): void {
    this.manualTickerSearch = '';
    this.manualSelectedTickers.clear();
    this.forceReprocess = false;
    this.forceReprocessConfirmationRequired = false;
    this.manualSubmitting = false;
    this.manualError = null;
    this.manualSuccess = null;
    this.activeManualRun = null;
  }

  private errorText(error: unknown, fallback: string): string {
    return typeof error === 'string' && error.trim() ? error : fallback;
  }
}
