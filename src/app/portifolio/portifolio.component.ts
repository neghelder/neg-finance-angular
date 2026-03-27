import { Component } from '@angular/core';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { PieComponent } from '../shared/widgets/pie/pie.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { PortifolioService } from './portifolio.service';
import { ColDef } from 'ag-grid-community';
import { AsyncPipe, CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { tap } from 'rxjs';
import { AssetTypeSelectorComponent, AssetTypeOption } from '../shared/asset-type-selector/asset-type-selector.component';
import { LoadingBarComponent } from '../shared/loading-bar/loading-bar.component';
import { Portifolio } from './portifolio';

@Component({
  selector: 'app-portifolio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDividerModule,
    GridComponent,
    PieComponent,
    AsyncPipe,
    CurrencyPipe,
    MatRadioModule,
    MatCardModule,
    AssetTypeSelectorComponent,
    LoadingBarComponent
  ],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})

export class PortifolioComponent {

  customPriceRenderer(params: any) {
    const formattedValue = `$${params.value.toFixed(2)}`;
    return `<span style="color: ${params.value < 0 ? 'red' : 'green'}">${formattedValue}</span>`;
  }

  colDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100 },
    { field: 'amount', headerName: 'Quant.', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100, cellRenderer: this.customPriceRenderer },
    { field: 'mean_price', headerName: 'Preço Médio', width: 150, cellRenderer: this.customPriceRenderer },
    { field: 'market_value', headerName: 'Preço de Mercado', width: 150, cellRenderer: this.customPriceRenderer },
    { field: 'unrealized_gain', headerName: 'Ganho', width: 100, cellRenderer: this.customPriceRenderer },
    { field: 'sector', headerName: 'Setor', width: 250 },
    { field: 'subsector', headerName: 'Sub-Setor', width: 250 }
  ];

  mode: string = 'ByPosition';
  loading: boolean = true;
  pieChartData = new Map<string, Map<string, any[]>>();
  assetTypeOptions: AssetTypeOption[] = [];
  selectedAssetType: string = '';
  selectedPortfolio: Portifolio | null = null;
  allPortfolios: Portifolio[] = [];

  portifolio$ = this.portifolioService.portifolio$.pipe(
    tap(ports => {
      this.allPortfolios = ports;
      this.loading = false;

      // Build selector options from the returned data
      this.assetTypeOptions = ports.map(p => ({
        label: p.name.replaceAll('_', ' '),
        value: p.name
      }));

      // Build pie chart data
      for (let port of ports) {
        const types = new Map<string, any[]>();

        const positions = port.assets.map(asset => ({
          name: asset.ticker,
          y: asset.market_value
        }));
        types.set('ByPosition', positions);

        const sectorsMap: { [key: string]: any } = {};
        for (let asset of port.assets) {
          const sector = asset.sector ? asset.sector : 'N/A';
          sectorsMap[sector] = (sectorsMap[sector] || 0) + 1;
        }
        const sectors = Object.entries(sectorsMap).map(sector => ({
          name: sector[0],
          y: sector[1]
        }));
        types.set('BySector', sectors);

        const subSectorsMap: { [key: string]: any } = {};
        for (let asset of port.assets) {
          const subsector = asset.subsector ? asset.subsector : 'N/A';
          subSectorsMap[subsector] = (subSectorsMap[subsector] || 0) + 1;
        }
        const subsectors = Object.entries(subSectorsMap).map(sector => ({
          name: sector[0],
          y: sector[1]
        }));
        types.set('BySubSector', subsectors);

        this.pieChartData.set(port.name, types);
      }

      // Auto-select first option if nothing selected yet
      if (!this.selectedAssetType && ports.length > 0) {
        this.selectedAssetType = ports[0].name;
        this.selectedPortfolio = ports[0];
      }
    })
  );

  constructor(private portifolioService: PortifolioService) {}

  onAssetTypeChange(value: string): void {
    this.selectedAssetType = value;
    this.selectedPortfolio = this.allPortfolios.find(p => p.name === value) || null;
  }
}
