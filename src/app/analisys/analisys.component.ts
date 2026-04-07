import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { AnalisysService } from './analisys.service';
import { AnalysisSet } from './models/analysisSet';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { AssetTypeSelectorComponent, AssetTypeOption } from '../shared/asset-type-selector/asset-type-selector.component';
import { LoadingBarComponent } from '../shared/loading-bar/loading-bar.component';


@Component({
  selector: 'app-analisys',
  standalone: true,
  imports: [
    CommonModule,
    RecommendationsComponent,
    GridComponent,
    AssetTypeSelectorComponent,
    LoadingBarComponent
  ],
  templateUrl: './analisys.component.html',
  styleUrl: './analisys.component.scss'
})
export class AnalisysComponent implements OnInit {

  assetTypeOptions: AssetTypeOption[] = [
    { label: 'BR Shares', value: 'SHARES' },
    { label: 'BR REITs', value: 'REITS' }
  ];

  colDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'price_limit', headerName: 'P. Limite', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'pl', headerName: 'P/L', width: 100 },
    { field: 'pvp', headerName: 'P/VP', width: 100 },
    { field: 'dy', headerName: 'DY', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'pegratio', headerName: 'Peg. Ratio', width: 150, cellRenderer: this.percentageRenderer },
    { field: 'lpa', headerName: 'LPA', width: 100 },
    { field: 'mrgebit', headerName: 'Marg. EBIT', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'mrgliq', headerName: 'Marg. Liq.', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'roic', headerName: 'ROIC', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'roe', headerName: 'ROE', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'cl5y', headerName: 'CL5Y', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'liqday', headerName: 'Liq. Diária', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'grades', headerName: 'Nota', width: 100 },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  colReitsDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100, pinned: 'left' },
    { field: 'price', headerName: 'Preço', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'price_limit', headerName: 'P. Limite', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'pvp', headerName: 'P/VP', width: 100 },
    { field: 'dy', headerName: 'DY', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'last_div', headerName: 'Last DY', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'market_value', headerName: 'V. Mercado', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'patr', headerName: 'Patr', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'shareholders', headerName: 'Cotistas', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'management', headerName: 'Gestão', width: 100 },
    { field: 'cd3y', headerName: 'CD3Y', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'c3y', headerName: 'C3Y', width: 100, cellRenderer: this.percentageRenderer },
    { field: 'liqday', headerName: 'Liq. Diária', width: 100, cellRenderer: this.largeNumberFormatter },
    { field: 'grades', headerName: 'Nota', width: 100 },
    { field: 'mean_price', headerName: 'P. Médio', width: 100, cellRenderer: this.currencyFormatter },
    { field: 'to_buy', headerName: 'Comprar', width: 100 },
    { field: 'to_equalize', headerName: 'Equalizar', width: 100 }
  ];

  loading = false;
  analysisSets: AnalysisSet<any>[] = [];
  analysisSets$: Observable<AnalysisSet<any>[]>;
  selectedAssetType$ = new BehaviorSubject<string>('SHARES');
  selectedTab: string = 'SHARES';
  currentColDefs: ColDef[] = this.colDefs;

  // Segmented nav for analysis sets
  setLabels: string[] = [];
  selectedSetIndex: number = 0;
  selectedSetData: any[] = [];

  constructor(private analysisService: AnalisysService) {}

  ngOnInit(): void {
    this.analysisSets$ = this.selectedAssetType$.pipe(
      tap(type => {
        setTimeout(() => {
          this.selectedTab = type;
          this.loading = true;
          this.currentColDefs = type === 'SHARES' ? this.colDefs : this.colReitsDefs;
        });
      }),
      switchMap(type => {
        if (type === 'SHARES') {
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

  customPriceRenderer(params: any) {
    const formattedValue = `$${params.value.toFixed(2)}`;
    return `<span style="color: ${params.value < 0 ? 'red' : 'green'}">${formattedValue}</span>`;
  }

  percentageRenderer(params: any) {
    const formattedValue = `${(params.value * 100).toFixed(1)}%`;
    return `<span style="color: ${params.value < 0 ? 'red' : 'green'}">${formattedValue}</span>`;
  }

  currencyFormatter(params: any) {
    return `${params.value ? '$ ' + params.value?.toFixed(2) : 'N/A'}`;
  }

  largeNumberFormatter(params: any): string {
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
  }
}
