import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { GridComponent } from '../shared/widgets/grid/grid.component';
import { PieComponent } from '../shared/widgets/pie/pie.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { PortifolioService } from './portifolio.service';
import { ColDef } from 'ag-grid-community';
import { AsyncPipe, CommonModule, CurrencyPipe, formatCurrency } from '@angular/common';
import {FormsModule} from '@angular/forms';
import { PortifolioResolverService } from './portifolio-resolver.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-portifolio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatDividerModule,
    GridComponent,
    PieComponent,
    AsyncPipe,
    CurrencyPipe,
    MatRadioModule
  ],
  // providers: [
  //   PortifolioResolverService
  // ],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})

export class PortifolioComponent {

  customPriceRenderer(params: any) {
    // params.value contains the cell value
    const formattedValue = `$${params.value.toFixed(2)}`;
    return `<span style="color: ${params.value < 0 ? 'red' : 'green'}">${formattedValue}</span>`;
  }

  colDefs: ColDef[] = [
    { field: 'ticker', headerName: 'Papel', width: 100 },
    { field: 'amount', headerName: 'Quant.', width: 100 },
    { field: 'cost', headerName: 'Custo', width: 100, cellRenderer: this.customPriceRenderer },
    { field: 'mean_price', headerName: 'Preço Médio', width: 150, cellRenderer: this.customPriceRenderer },
    { field: 'total_mkt_price', headerName: 'Preço de Mercado', width: 150, cellRenderer: this.customPriceRenderer },
    { field: 'unrealized_gain', headerName: 'Ganho', width: 100, cellRenderer: this.customPriceRenderer },
    { field: 'sector', headerName: 'Setor', width: 250 },
    { field: 'subsector', headerName: 'Sub-Setor', width: 250 }
  ];

  mode: string = 'ByPosition';
  pieChartData = new Map<string,Map<string, any[]>>();

  portifolio$ = this.portifolioService.portifolio$.pipe(
    tap( ports => {
      for(let port of ports) {
        const types = new Map<string, any[]>();
        
        const positions = port.assets.map(asset => {
          return {
            name: asset.ticker,
            y: asset.total_mkt_price
          };
        });
        types.set('ByPosition', positions);


        const sectorsMap: { [key: string]: any } = {};
        for(let asset of port.assets) {
          const sector = asset.sector ? asset.sector : 'N/A';
          sectorsMap[sector] = (sectorsMap[sector] || 0) + 1;
        }

        const sectors = Object.entries(sectorsMap).map(sector => {
          return {
            name: sector[0],
            y: sector[1]
          }
        })

        types.set('BySector', sectors);

        const subSectorsMap: { [key: string]: any } = {};
        for(let asset of port.assets) {
          const subsector = asset.subsector ? asset.subsector : 'N/A';
          subSectorsMap[subsector] = (subSectorsMap[subsector] || 0) + 1;
        }

        const subsectors = Object.entries(subSectorsMap).map(sector => {
          return {
            name: sector[0],
            y: sector[1]
          }
        })
        types.set('BySubSector', subsectors);
        
        this.pieChartData.set(port.name, types)
      }
    })
  )

  constructor(private portifolioService: PortifolioService) {}

}
