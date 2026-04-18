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


@Component({
  selector: 'app-analisys',
  standalone: true,
  imports: [
    CommonModule,
    RecommendationsComponent,
    GridComponent,
    AssetTypeSelectorComponent,
    LoadingBarComponent,
    RouterModule
  ],
  templateUrl: './analisys.component.html',
  styleUrl: './analisys.component.scss'
})
export class AnalisysComponent implements OnInit {

  assetTypeOptions: AssetTypeOption[] = [
    { label: 'BR Shares', value: 'SHARE' },
    { label: 'BR REITs', value: 'REIT' }
  ];

  activeCriteria: CriteriaConfig | null = null;

  failsCriteria(field: string, value: number): boolean {
    if (!this.activeCriteria || value === null || value === undefined) return false;
    const origin = 'BR';
    const assetType = this.selectedTab; // 'SHARES' or 'REITS'
    const criteria = this.activeCriteria[assetType]?.[origin]?.[field];
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

  constructor(private analysisService: AnalisysService) { }

  ngOnInit(): void {
    this.analysisService.getCriteria().subscribe(c => {
      this.activeCriteria = c;
    });

    this.analysisSets$ = this.selectedAssetType$.pipe(
      tap(type => {
        setTimeout(() => {
          this.selectedTab = type;
          this.loading = true;
          this.currentColDefs = type === 'SHARE' ? this.colDefs : this.colReitsDefs;
        });
      }),
      switchMap(type => {
        if (type === 'SHARE') {
          return this.analysisService.shareAnalysis$;
        } else {
          return this.analysisService.reitAnalysis$;
        }
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

  onSetSelected(index: number): void {
    this.selectedSetIndex = index;
    this.selectedSetData = this.analysisSets[index]?.analisys || [];
  }


}
