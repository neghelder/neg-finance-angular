import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { AnalisysService } from './analisys.service';
import { AnalysisSet } from './models/analysisSet';
import { Stock } from './models/stock';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { BehaviorSubject, Observable, of, switchMap, tap } from 'rxjs';


@Component({
  selector: 'app-analisys',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    RecommendationsComponent,
    GridComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './analisys.component.html',
  styleUrl: './analisys.component.scss'
})
export class AnalisysComponent implements OnInit {

  investClasses = [
    { Type: 'SHARES', Origin: 'BR'},
    { Type: 'REITS', Origin: 'BR'}
  ]

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

  // ['segment', 'pvp', 'dy', 'last_div', 'market_value', 'liqday', 'cd3y', 'c3y', 'patr', 'shareholders', 'management', 'grades', 'mean_price', 'to_buy', 'to_equalize'
  
  recommendations = []

  gettingData = false;
  analysisSets$ : Observable<AnalysisSet<any>[]>;  

  selectedAssetType$ = new BehaviorSubject<string>('SHARES');
  selectedTab: string;

  constructor(private analysisService: AnalisysService) {}

  ngOnInit(): void {
    this.analysisSets$ = this.selectedAssetType$.pipe(
      switchMap(type => {
        this.selectedTab = type;
        if(type === "SHARES") {
          return this.analysisService.shareAnalysis$;
        } else {
          return  this.analysisService.reitAnalysis$;
        }
      })
    )
  }

  tabChanged(event: MatTabChangeEvent) {
    this.gettingData = true;
    if(event.tab?.textLabel) {
      this.selectedAssetType$.next(event.tab.textLabel);
    }    
  }

  customPriceRenderer(params: any) {
    // params.value contains the cell value
    const formattedValue = `$${params.value.toFixed(2)}`;
    return `<span style="color: ${params.value < 0 ? 'red' : 'green'}">${formattedValue}</span>`;
  }

  percentageRenderer(params: any) {
    // params.value contains the cell value
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
