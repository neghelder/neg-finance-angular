import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';
import { AnalisysService } from '../analisys.service';
import { ScheduledReportsComponent } from './scheduled-reports.component';
import { ScheduledReportSnapshot } from '../models/scheduled-report';

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent { @Input() loading = false; }

const snapshot: ScheduledReportSnapshot = {
  id: 'snapshot-1', run_id: 'run-1', asset_type: 'FII', ticker: 'HGLG11',
  portfolio_status: 'MY_CHEAP', final_label: 'COMPRAR', created_at: '2026-09-02T08:02:00',
  market: { status: 'CHEAP', grade: 8, rank: 2, criterion_results: { pvp: true }, cohort_size: 20, criteria_hash: 'criteria-v1', snapshot_at: '2026-09-02T08:00:00' },
  qualitative: { status: 'AVAILABLE', analysis_id: 'analysis-1', analysed_at: '2026-09-02T08:01:00', quality: 8, confidence: 'HIGH', critical_risk: false, evidence: [{ page: 2, claim: 'Vacancy fell' }], details: { thesis: 'quality assets' } },
  source: { document_id: 'doc-1', url: 'https://cvm.example/doc', published_at: '2026-09-01T08:00:00', fetched_at: '2026-09-02T08:00:00', pdf_sha256: 'hash', revision: '2', metadata: { source: 'CVM' } },
  freshness: { status: 'FRESH', qualitative_status: 'AVAILABLE', source_revision_matches_analysis: true, analysis_created_at: '2026-09-02T08:01:00', source_published_at: '2026-09-01T08:00:00' },
  conflicts: { has_conflict: false, qualitative_variants_for_revision: 1, source_revision_count: 1 },
  partial_failure: { is_partial: false, job_status: 'FINALIZED', attempts: 1 },
  details: { asset_type: 'FII', qualitative: { thesis: 'quality assets' }, cvm: { vacancy: 0.02 } }
};

describe('ScheduledReportsComponent', () => {
  let component: ScheduledReportsComponent;
  let fixture: ComponentFixture<ScheduledReportsComponent>;
  let service: {
    getScheduledReports: jest.Mock;
    getReportAutomationStatus: jest.Mock;
    getReportAutomationAssets: jest.Mock;
    getScheduledReportHistory: jest.Mock;
    createReportAutomationRun: jest.Mock;
    getReportAutomationRun: jest.Mock;
    retryReportAutomationRun: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getScheduledReports: jest.fn(() => of([snapshot])),
      getReportAutomationStatus: jest.fn(() => of({ runs: [], jobs: { QUEUED: 1 }, config: {}, runtime: { codex_available: true, auth_available: true } })),
      getReportAutomationAssets: jest.fn(() => of({ asset_type: 'FII', tickers: ['HGLG11', 'KNRI11'], max_jobs_per_run: 2 })),
      getScheduledReportHistory: jest.fn(() => of([snapshot])),
      createReportAutomationRun: jest.fn(request => of({ run_id: 'manual-run-1', status: 'QUEUED', tickers: request.tickers })),
      getReportAutomationRun: jest.fn(() => of({
        run_id: 'manual-run-1', status: 'QUEUED', requested: { asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false },
        jobs: { QUEUED: 1 }, diagnostics: [], errors: []
      })),
      retryReportAutomationRun: jest.fn(() => of({
        run_id: 'manual-run-2', status: 'QUEUED', requested: { asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false },
        jobs: { QUEUED: 1 }, diagnostics: [], errors: []
      }))
    };

    await TestBed.configureTestingModule({ imports: [ScheduledReportsComponent] })
      .overrideComponent(ScheduledReportsComponent, {
        set: { imports: [CommonModule, FormsModule, MatTooltipModule, MockLoadingBarComponent] }
      })
      .overrideProvider(AnalisysService, { useValue: service })
      .compileComponents();

    fixture = TestBed.createComponent(ScheduledReportsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('loads the selected class and scheduler status without a write action', () => {
    component.assetType = 'FII';
    component.load();

    expect(service.getScheduledReports).toHaveBeenCalledWith('FII');
    expect(service.getReportAutomationStatus).toHaveBeenCalled();
    expect(service.getReportAutomationAssets).toHaveBeenCalledWith('FII');
    expect(component.reports).toEqual([snapshot]);
    expect(component.visibleReports).toEqual([]);
    expect(component.automationStatus?.jobs['QUEUED']).toBe(1);
  });

  it('keeps only the newest report for each asset in the main list', () => {
    const newest = { ...snapshot, id: 'snapshot-2', created_at: '2026-09-03T08:02:00' };
    const anotherAsset = { ...snapshot, id: 'snapshot-3', ticker: 'KNRI11', created_at: '2026-09-01T08:02:00' };
    service.getScheduledReports.mockReturnValue(of([snapshot, newest, anotherAsset]));
    component.assetType = 'FII';

    component.load();

    expect(component.reports.map(report => report.id)).toEqual(['snapshot-2', 'snapshot-3']);
  });

  it('starts with no reports visible and filters the available assets on demand', () => {
    const anotherAsset = { ...snapshot, id: 'snapshot-2', ticker: 'KNRI11' };
    service.getScheduledReports.mockReturnValue(of([snapshot, anotherAsset]));
    component.assetType = 'FII';
    component.load();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.report-card')).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('Selecione um ou mais ativos');

    const search = fixture.nativeElement.querySelector('.asset-filter .ticker-search input') as HTMLInputElement;
    search.value = 'knri';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.filteredTickers).toEqual(['KNRI11']);

    const tickerCheckbox = fixture.nativeElement.querySelector('.asset-filter .ticker-options input') as HTMLInputElement;
    tickerCheckbox.click();
    fixture.detectChanges();

    expect(component.visibleReports.map(report => report.ticker)).toEqual(['KNRI11']);
    expect(fixture.nativeElement.querySelector('.report-card h4').textContent).toContain('KNRI11');

    fixture.nativeElement.querySelectorAll('.asset-filter .filter-actions button')[1].click();
    fixture.detectChanges();
    expect(component.visibleReports).toEqual([]);

    fixture.nativeElement.querySelectorAll('.asset-filter .filter-actions button')[0].click();
    expect(component.visibleReports.map(report => report.ticker)).toEqual(['KNRI11']);
  });

  it('loads the supported manual-request catalogue and enforces its configured selection limit', () => {
    component.assetType = 'FII';
    component.load();

    expect(component.supportedAssets?.tickers).toEqual(['HGLG11', 'KNRI11']);
    expect(component.maxManualJobs).toBe(2);

    component.setManualTickerSearch('knri');
    expect(component.filteredManualTickers).toEqual(['KNRI11']);
    component.setManualTickerSelected('KNRI11', true);
    component.setManualTickerSelected('HGLG11', true);
    component.setManualTickerSelected('MXRF11', true);

    expect(component.manualSelectedTickers).toEqual(new Set(['KNRI11', 'HGLG11']));
    expect(component.manualError).toContain('no máximo 2');
  });

  it('requests selected assets and polls their individual progress', () => {
    component.assetType = 'FII';
    component.load();
    component.setManualTickerSelected('HGLG11', true);

    component.requestManualRun();

    expect(service.createReportAutomationRun).toHaveBeenCalledWith({
      asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false
    });
    expect(service.getReportAutomationRun).toHaveBeenCalledWith('manual-run-1');
    expect(component.activeManualRun?.status).toBe('QUEUED');
    expect(component.manualRunTickerStatus('HGLG11')).toBe('QUEUED');
    expect(component.runStatusLabel('ANALYZING')).toBe('Analisando');
  });

  it('requires explicit confirmation before forcing an existing document through analysis', () => {
    component.assetType = 'FII';
    component.load();
    component.setManualTickerSelected('HGLG11', true);
    component.forceReprocess = true;

    component.requestManualRun();

    expect(component.forceReprocessConfirmationRequired).toBe(true);
    expect(service.createReportAutomationRun).not.toHaveBeenCalled();

    component.confirmForceReprocess();

    expect(service.createReportAutomationRun).toHaveBeenCalledWith({
      asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: true
    });
  });

  it('disables manual requests with a clear runtime instruction', () => {
    service.getReportAutomationStatus.mockReturnValue(of({
      runs: [], jobs: {}, config: {}, runtime: { codex_available: false, auth_available: false }
    }));
    component.assetType = 'FII';
    component.load();
    component.setManualTickerSelected('HGLG11', true);

    component.requestManualRun();

    expect(component.isAutomationRuntimeAvailable).toBe(false);
    expect(component.automationRuntimeMessage).toContain('Codex CLI');
    expect(component.manualError).toContain('Codex CLI');
    expect(service.createReportAutomationRun).not.toHaveBeenCalled();
  });

  it('refreshes and selects reports created by a completed request', () => {
    const finalized = {
      run_id: 'manual-run-1', status: 'FINALIZED',
      requested: { asset_type: 'FII' as const, tickers: ['HGLG11'], force_reprocess: false },
      jobs: { FINALIZED: 1 }, diagnostics: [], errors: []
    };
    service.getReportAutomationRun.mockReturnValue(of(finalized));
    component.assetType = 'FII';
    component.load();
    component.setManualTickerSelected('HGLG11', true);

    component.requestManualRun();

    expect(component.activeManualRun?.status).toBe('FINALIZED');
    expect(component.selectedTickers.has('HGLG11')).toBe(true);
    expect(component.manualSuccess).toContain('concluída');
  });

  it('retries a terminal partial run through the dedicated endpoint', () => {
    service.getReportAutomationRun.mockReturnValue(of({
      run_id: 'manual-run-2', status: 'QUEUED',
      requested: { asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false },
      jobs: { QUEUED: 1 }, diagnostics: [], errors: []
    }));
    component.activeManualRun = {
      run_id: 'manual-run-1', status: 'PARTIAL',
      requested: { asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false },
      jobs: { FAILED: 1 }, diagnostics: [], errors: [{ ticker: 'HGLG11', code: 'PROCESSING_FAILED', attempts: 1, status: 'FAILED' }]
    };

    component.retryManualRun();

    expect(service.retryReportAutomationRun).toHaveBeenCalledWith('manual-run-1');
    expect(component.activeManualRun?.run_id).toBe('manual-run-2');
  });

  it('loads immutable history on demand', () => {
    component.showHistory(snapshot);

    expect(service.getScheduledReportHistory).toHaveBeenCalledWith('FII', 'HGLG11');
    expect(component.selectedHistory).toEqual([snapshot]);
    expect(component.selectedHistoryReport).toBe(snapshot);
    expect(component.selectedTicker).toBe('HGLG11');
    expect(component.historyLoading).toBe(false);
  });

  it('lets the user select a previous report from the history panel', () => {
    const older = { ...snapshot, id: 'snapshot-old', created_at: '2026-08-01T08:02:00', final_label: 'NEUTRO' as const };
    service.getScheduledReportHistory.mockReturnValue(of([older, snapshot]));
    component.reports = [snapshot];
    component.setTickerSelected('HGLG11', true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.history-button').click();
    fixture.detectChanges();

    const historyButtons = fixture.nativeElement.querySelectorAll('.history-snapshot');
    expect(historyButtons).toHaveLength(2);
    expect(component.selectedHistoryReport?.id).toBe('snapshot-1');

    historyButtons[1].click();
    fixture.detectChanges();

    expect(component.selectedHistoryReport?.id).toBe('snapshot-old');
    expect(historyButtons[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('marks missing and stale qualitative evidence explicitly', () => {
    expect(component.qualitativeState({ ...snapshot, qualitative: { ...snapshot.qualitative, analysis_id: null }, freshness: { ...snapshot.freshness, qualitative_status: 'UNAVAILABLE' } })).toBe('Sem análise qualitativa');
    expect(component.qualitativeState({ ...snapshot, qualitative: { ...snapshot.qualitative, status: 'STALE' } })).toBe('Qualitativo desatualizado');
  });

  it('shows source conflicts and partial failures without technical details', () => {
    const partial: ScheduledReportSnapshot = { ...snapshot, conflicts: { ...snapshot.conflicts, has_conflict: true, source_revision_count: 2 }, partial_failure: { is_partial: true, job_status: 'DEAD_LETTER', attempts: 3 } };
    expect(component.sourceState(partial)).toBe('Há versões conflitantes');
    expect(component.hasPartialFailure(partial)).toBe(true);
  });

  it('separates and explains the quantitative indicators', () => {
    component.reports = [snapshot];
    component.setTickerSelected('HGLG11', true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Pontuação quantitativa');
    expect(text).toContain('Posição entre aprovados');
    expect(text).toContain('Universo analisado');
    expect(component.marketScoreTooltip('FII')).toContain('P/VP e dividend yield');
    expect(component.marketScoreTooltip('STOCK')).toContain('P/L, ROE, P/VP e margem líquida');
    expect(component.rankTooltip()).toContain('passaram pelos critérios');
  });

  it('translates all document freshness states', () => {
    expect(component.sourceState(snapshot)).toBe('Documento e análise atualizados');
    expect(component.sourceState({ ...snapshot, freshness: { ...snapshot.freshness, status: 'STALE' } })).toBe('Análise desatualizada para o documento atual');
    expect(component.sourceState({ ...snapshot, freshness: { ...snapshot.freshness, status: 'PENDING' } })).toBe('Análise em processamento');
    expect(component.sourceState({ ...snapshot, freshness: { ...snapshot.freshness, status: 'UNAVAILABLE' }, source: null })).toBe('Documento ou análise indisponível');
  });

  it('renders the populated source, evidence and class details rather than placeholders', () => {
    component.reports = [snapshot];
    component.setTickerSelected('HGLG11', true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('doc-1');
    expect(text).toContain('Vacancy fell');
    expect(text).toContain('P/VP');
    expect(text).toContain('Sim');
    expect(text).not.toContain('{"pvp":true}');
    expect(text).not.toContain('{"thesis":"quality assets"}');
    expect(text).toContain('Detalhes qualitativos e CVM do FII');
  });

  it('renders qualitative evidence only once when it is also embedded in the details', () => {
    const evidence = [{ page: 2, claim: 'Vacancy fell' }];
    component.reports = [{
      ...snapshot,
      qualitative: { ...snapshot.qualitative, evidence },
      details: { ...snapshot.details, qualitative: { thesis: 'Quality assets', evidence } }
    }];
    component.setTickerSelected('HGLG11', true);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text.match(/Vacancy fell/g)).toHaveLength(1);
    expect(text).toContain('Quality assets');
  });

  it('formats nested detail values as labelled rows', () => {
    expect(component.detailRows({ occupancy: { physical_pct: 3.91 }, status: 'PASS' })).toEqual([
      { label: 'Occupancy · Physical pct', value: '3,91' },
      { label: 'Status', value: 'Atende' }
    ]);
    expect(component.detailRows([{ claim: 'Vacância caiu', critical_risk: false }])).toEqual([
      { label: 'Item 1 · Conclusão', value: 'Vacância caiu' },
      { label: 'Item 1 · Risco crítico', value: 'Não' }
    ]);
  });

  it('keeps a readable error state when either read endpoint fails', () => {
    service.getScheduledReports.mockReturnValue(throwError(() => 'network failure'));
    component.assetType = 'FII';
    component.load();

    expect(component.errorMessage).toBe('network failure');
    expect(component.reports).toEqual([]);
  });
});
