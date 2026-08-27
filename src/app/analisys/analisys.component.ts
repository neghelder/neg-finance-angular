import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { ColDef, CellStyle } from 'ag-grid-community';
import { AnalisysService } from './analisys.service';
import { AnalysisSet } from './models/analysisSet';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { AssetTypeSelectorComponent, AssetTypeOption } from '../shared/asset-type-selector/asset-type-selector.component';
import { LoadingBarComponent } from '../shared/loading-bar/loading-bar.component';
import { CriteriaConfig } from './models/criteria';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FiagroReportsComponent } from './fiagro-reports/fiagro-reports.component';


@Component({
  selector: 'app-analisys',
  standalone: true,
  imports: [
    CommonModule,
    RecommendationsComponent,
    GridComponent,
    AssetTypeSelectorComponent,
    LoadingBarComponent,
    RouterModule,
    FormsModule,
    FiagroReportsComponent
  ],
  templateUrl: './analisys.component.html',
  styleUrl: './analisys.component.scss'
})
export class AnalisysComponent implements OnInit {

  assetTypeOptions: AssetTypeOption[] = [
    { label: 'BR Shares', value: 'BR_SHARE' },
    { label: 'BR REITs', value: 'BR_REIT' },
    { label: 'BR FIAGROs', value: 'BR_FIAGRO' },
    { label: 'BR BDRs', value: 'BR_BDR' },
    { label: 'USA Shares', value: 'USA_SHARE' },
    { label: 'USA REITs', value: 'USA_REIT' },
    { label: 'USA ETFs', value: 'USA_ETF' }
  ];

  activeCriteria: CriteriaConfig | null = null;

  parseAssetSelection(value: string): { origin: string; type: string } {
    if (value && value.includes('_')) {
      const parts = value.split('_');
      return { origin: parts[0], type: parts[1] };
    }
    // Fallback for simple values (for tests and backwards compatibility)
    let origin = 'BR';
    if (value === 'ETF') {
      origin = 'USA';
    }
    return { origin, type: value };
  }

  get selectedType(): string {
    const { type } = this.parseAssetSelection(this.selectedTab);
    return type;
  }

  get selectedOrigin(): string {
    const { origin } = this.parseAssetSelection(this.selectedTab);
    return origin;
  }

  failsCriteria(field: string, value: number): boolean {
    if (!this.activeCriteria || value === null || value === undefined) return false;
    const { origin, type } = this.parseAssetSelection(this.selectedTab);
    const criteria = this.activeCriteria[type]?.[origin]?.[field];
    if (!criteria) return false;

    if ((criteria.min !== undefined && value < criteria.min) ||
      (criteria.max !== undefined && value > criteria.max)) {
      return true;
    }
    return false;
  }

  percentageRenderer = (params: any) => {
    if (params.value === null || params.value === undefined) return '';
    const formattedValue = `${(params.value * 100).toFixed(1)}%`;
    return `<span>${formattedValue}</span>`;
  };

  currencyFormatter = (params: any) => {
    return `${params.value ? '$ ' + params.value?.toFixed(2) : 'N/A'}`;
  };

  largeNumberFormatter = (params: any): string => {
    const value = params.value;

    if (value === null || value === undefined) {
      return '';
    }

    if (Math.abs(value) >= 1_000_000_000_000) {
      return `${(value / 1_000_000_000_000).toFixed(2)}T`;
    } else if (Math.abs(value) >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  };

  cellStyleFn = (params: any): CellStyle => {
    if (this.failsCriteria(params.colDef?.field, params.value)) {
      return { color: 'red', fontWeight: 'bold' };
    }
    return { color: 'green' };
  };

  colDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'price_limit', headerName: 'P. Limite', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'pl', headerName: 'P/L', width: 100, cellStyle: this.cellStyleFn },
    { field: 'pvp', headerName: 'P/VP', width: 100, cellStyle: this.cellStyleFn },
    { field: 'dy', headerName: 'DY', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'pegratio', headerName: 'Peg. Ratio', width: 150, cellRenderer: this.percentageRenderer },
    { field: 'lpa', headerName: 'LPA', width: 100, cellStyle: this.cellStyleFn },
    { field: 'mrgebit', headerName: 'Marg. EBIT', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'mrgliq', headerName: 'Marg. Liq.', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'roic', headerName: 'ROIC', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'roe', headerName: 'ROE', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'cl5y', headerName: 'CL5Y', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'liqday', headerName: 'Liq. Diária', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'grades', headerName: 'Nota', width: 100 },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  colReitsDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'price_limit', headerName: 'P. Limite', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'pvp', headerName: 'P/VP', width: 100, cellStyle: this.cellStyleFn },
    { field: 'dy', headerName: 'DY', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'last_div', headerName: 'Last DY', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'market_value', headerName: 'V. Mercado', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'patr', headerName: 'Patr', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'shareholders', headerName: 'Cotistas', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'management', headerName: 'Gestão', width: 100 },
    { field: 'cd3y', headerName: 'CD3Y', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'c3y', headerName: 'C3Y', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'liqday', headerName: 'Liq. Diária', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'grades', headerName: 'Nota', width: 100 },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  colEtfDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'dy', headerName: 'DY', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'expenseRatio', headerName: 'Taxa Adm', width: 100, cellRenderer: this.percentageRenderer, cellStyle: this.cellStyleFn },
    { field: 'navPrice', headerName: 'NAV', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'totalAssets', headerName: 'Patr.', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'fiftyTwoWeekLow', headerName: 'Mín 52S', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'fiftyTwoWeekHigh', headerName: 'Máx 52S', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'averageVolume', headerName: 'Vol. Médio', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  colBdrDefs: ColDef[] = this.colDefs;

  colFiagroDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'price_limit', headerName: 'P. Limite', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'pvp', headerName: 'P/VP', width: 100, cellStyle: this.cellStyleFn },
    { field: 'dy', headerName: 'DY', width: 100, cellStyle: this.cellStyleFn },
    { field: 'last_div', headerName: 'Last DY', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'liqday', headerName: 'Liq. Diária', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'cd3y', headerName: 'CD3Y', width: 100, cellStyle: this.cellStyleFn },
    { field: 'c3y', headerName: 'C3Y', width: 100, cellStyle: this.cellStyleFn },
    { field: 'patr', headerName: 'Patr', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'shareholders', headerName: 'Cotistas', width: 100, cellRenderer: this.largeNumberFormatter, cellStyle: this.cellStyleFn },
    { field: 'management', headerName: 'Gestão', width: 100 },
    { field: 'grades', headerName: 'Nota', width: 100 },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  loading = false;
  analysisSets: AnalysisSet<any>[] = [];
  analysisSets$: Observable<AnalysisSet<any>[]>;
  selectedAssetType$ = new BehaviorSubject<string>('SHARE');
  selectedTab: string = 'SHARE';
  currentColDefs: ColDef[] = this.colDefs;

  // Segmented nav for analysis sets
  setLabels: string[] = [];
  selectedSetIndex: number = 0;
  selectedSetData: any[] = [];

  watchlist: string[] = [];
  tickerInput: string = '';

  get currentCollection(): string {
    const { type } = this.parseAssetSelection(this.selectedTab);
    if (type === 'ETF') return 'USA_ETFS';
    if (type === 'BDR') return 'BR_BDRS';
    return '';
  }

  constructor(private analysisService: AnalisysService) { }

  ngOnInit(): void {
    this.analysisService.getCriteria().subscribe(c => {
      this.activeCriteria = c;
    });

    this.analysisSets$ = this.selectedAssetType$.pipe(
      tap(selection => {
        setTimeout(() => {
          let normalized = selection;
          if (selection === 'SHARE') normalized = 'BR_SHARE';
          else if (selection === 'REIT') normalized = 'BR_REIT';
          else if (selection === 'BDR') normalized = 'BR_BDR';
          else if (selection === 'ETF') normalized = 'USA_ETF';

          this.selectedTab = normalized;
          this.loading = true;
          const { origin, type } = this.parseAssetSelection(normalized);
          if (type === 'SHARE') {
            this.currentColDefs = this.colDefs;
          } else if (type === 'REIT') {
            this.currentColDefs = this.colReitsDefs;
          } else if (type === 'FIAGRO') {
            this.currentColDefs = this.colFiagroDefs;
          } else if (type === 'ETF') {
            this.currentColDefs = this.colEtfDefs;
          } else if (type === 'BDR') {
            this.currentColDefs = this.colBdrDefs;
          }
          this.loadWatchlist();
        });
      }),
      switchMap(selection => {
        const { origin, type } = this.parseAssetSelection(selection);
        if (type === 'SHARE') {
          return this.analysisService.getShareAnalysis ? this.analysisService.getShareAnalysis(origin) : this.analysisService.shareAnalysis$;
        } else if (type === 'REIT') {
          return this.analysisService.getReitAnalysis ? this.analysisService.getReitAnalysis(origin) : this.analysisService.reitAnalysis$;
        } else if (type === 'FIAGRO') {
          return this.analysisService.getFiagroAnalysis(origin);
        } else if (type === 'ETF') {
          return this.analysisService.getEtfAnalysis ? this.analysisService.getEtfAnalysis(origin) : this.analysisService.etfAnalysis$;
        } else if (type === 'BDR') {
          return this.analysisService.getBdrAnalysis ? this.analysisService.getBdrAnalysis(origin) : this.analysisService.bdrAnalysis$;
        }
        return [];
      }),
      tap(sets => {
        setTimeout(() => {
          this.loading = false;
          this.analysisSets = sets;

          // Build segmented nav labels from set names
          this.setLabels = sets.map(s => {
            const parts = s.name.split('_');
            return parts.length > 3 ? parts.slice(3).join(' ') : s.name;
          });

          // Auto-select first set
          this.selectedSetIndex = 0;
          this.selectedSetData = sets.length > 0 ? sets[0].analisys : [];
        });
      })
    );
  }

  onAssetTypeChange(value: string): void {
    this.selectedAssetType$.next(value);
  }

  onSetSelected(index: number) {
    this.selectedSetIndex = index;
    if (this.analysisSets.length > index && index >= 0) {
      this.selectedSetData = this.analysisSets[index].analisys;
    } else {
      this.selectedSetData = [];
    }
  }

  loadWatchlist() {
    const coll = this.currentCollection;
    if (coll) {
      this.analysisService.getWatchlist(coll).subscribe(w => this.watchlist = w);
    } else {
      this.watchlist = [];
    }
  }

  addToWatchlist() {
    const coll = this.currentCollection;
    if (coll && this.tickerInput) {
      this.analysisService.addToWatchlist(this.tickerInput.toUpperCase(), coll).subscribe(() => {
        this.tickerInput = '';
        this.loadWatchlist();
        this.selectedAssetType$.next(this.selectedTab); // Reload analysis
      });
    }
  }

  removeFromWatchlist(ticker: string) {
    const coll = this.currentCollection;
    if (coll) {
      this.analysisService.removeFromWatchlist(ticker, coll).subscribe(() => {
        this.loadWatchlist();
        this.selectedAssetType$.next(this.selectedTab); // Reload analysis
      });
    }
  }

}
