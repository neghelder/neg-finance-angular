import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BrokerageService } from '../brokerage.service';
import { ColDef, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';
import { GridComponent } from '../../shared/widgets/grid/grid.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreateNoteComponent } from './create-note/create-note.component';
import { RenameTickerComponent } from './rename-ticker/rename-ticker.component';
import { BrokerageCollection, Note } from '../brokerage';
import { map, Observable, tap } from 'rxjs';
import { AssetTypeSelectorComponent, AssetTypeOption } from '../../shared/asset-type-selector/asset-type-selector.component';
import { LoadingBarComponent } from '../../shared/loading-bar/loading-bar.component';

@Component({
  selector: 'app-brokerage-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GridComponent,
    MatButtonModule,
    MatIconModule,
    AssetTypeSelectorComponent,
    LoadingBarComponent
  ],
  templateUrl: './brokerage-history.component.html',
  styleUrl: './brokerage-history.component.scss'
})

export class BrokerageHistoryComponent {

  colDefs: ColDef[] = [
    { field: 'date', headerName: 'Data', width: 115, cellRenderer: this.inputRenderer },
    { field: 'ticker', headerName: 'Papel', width: 100, cellRenderer: this.inputRenderer, filter: 'agTextColumnFilter' },
    { field: 'op', headerName: 'OP', width: 60, cellRenderer: this.inputRenderer },
    { field: 'qtd', headerName: 'Quant.', width: 80, cellRenderer: this.inputRenderer },
    { field: 'price', headerName: 'Preço', width: 80, cellRenderer: this.inputRenderer },
    { field: 'total_rat', headerName: 'Taxas', width: 70, cellRenderer: this.inputRenderer },
    { field: 'total_cost', headerName: 'Custo Total', width: 110, cellRenderer: this.numberRenderer },
    { field: 'rat', headerName: 'Taxa', width: 70, cellRenderer: this.numberRenderer },
    { field: 'net_price', headerName: 'Custo Líq.', width: 100, cellRenderer: this.numberRenderer },
    { field: 'amount', headerName: 'Estoque', width: 90, cellRenderer: this.numberRenderer },
    { field: 'mean_price', headerName: 'P. Médio', width: 90, cellRenderer: this.numberRenderer },
    { field: 'gain_miss', headerName: 'Ganho/Perda', width: 120, cellRenderer: this.numberRenderer },
    { field: 'taxes_month', headerName: 'IR/Mês', width: 100, cellRenderer: this.numberRenderer },
    { field: 'ref_month', headerName: 'Mês Ref.', width: 100 },
    { field: 'sells_month', headerName: 'Vendas/Mês', width: 110, cellRenderer: this.numberRenderer }
  ];

  loading: boolean = true;
  assetTypeOptions: AssetTypeOption[] = [];
  selectedAssetType: string = '';
  selectedTab: string = '';
  selectedNotes: Note[] = [];
  tickerNames: string[];

  brokerageCollection$: Observable<BrokerageCollection[]>;
  allCollections: BrokerageCollection[] = [];

  selectedData: any = undefined;
  lastSelectedRownIndex = -1;

  note: Note = {
    ticker: '',
    date: '',
    op: 'C',
    price: 0,
    qtd: 0,
    total_rat: 0
  };

  @ViewChild(GridComponent) gridComponent: GridComponent;
  @ViewChildren(GridComponent) grids!: QueryList<GridComponent>;
  private gridApi!: any;

  constructor(private brokerageService: BrokerageService, public dialog: MatDialog) {
    this.brokerageCollection$ = this.brokerageService.brokerageHistory$.pipe(
      tap(collections => {
        setTimeout(() => {
          this.allCollections = collections;
          this.loading = false;

          // Build selector options
          this.assetTypeOptions = collections.map(c => ({
            label: c.name.replaceAll('_', ' '),
            value: c.name
          }));

          // Auto-select first if nothing selected yet
          if (!this.selectedAssetType && collections.length > 0) {
            this.selectedAssetType = collections[0].name;
            this.selectedTab = collections[0].name.replaceAll('_', ' ');
            this.selectedNotes = collections[0].notes;
            this.tickerNames = this.getTickersWithPositiveAmount(collections[0].notes);
          } else if (this.selectedAssetType) {
            // Refresh data for current selection (e.g. after CRUD)
            const current = collections.find(c => c.name === this.selectedAssetType);
            if (current) {
              this.selectedNotes = current.notes;
              this.tickerNames = this.getTickersWithPositiveAmount(current.notes);
            }
          }
        });
      })
    );
  }

  onAssetTypeChange(value: string): void {
    this.selectedAssetType = value;
    this.selectedTab = value.replaceAll('_', ' ');
    this.selectedData = undefined;

    const collection = this.allCollections.find(c => c.name === value);
    if (collection) {
      this.selectedNotes = collection.notes;
      this.tickerNames = this.getTickersWithPositiveAmount(collection.notes);
    }
  }

  private getTickersWithPositiveAmount(notes: Note[]): string[] {
    if (!notes || notes.length === 0) return [];

    // 1. Sort notes chronologically to ensure the last one processed per ticker is the most recent.
    // Assuming date format is DD/MM/YYYY
    const sortedNotes = [...notes].sort((a, b) => {
      const parse = (d: string) => {
        const p = d.split('/');
        return new Date(+p[2], +p[1] - 1, +p[0]).getTime();
      };
      return parse(a.date) - parse(b.date);
    });

    // 2. Map tickers to their latest amount.
    const tickerMap = new Map<string, number>();
    sortedNotes.forEach(n => {
      if (n.amount !== undefined) {
        const ticker = n.ticker.trim().toUpperCase();
        tickerMap.set(ticker, n.amount);
      }
    });

    // 3. Filter only those with a current amount > 0 and return unique sorted keys.
    return Array.from(tickerMap.entries())
      .filter(([_, amount]) => amount > 0)
      .map(([ticker, _]) => ticker)
      .sort();
  }

  numberRenderer(params: any) {
    const value = Number(params.value);
    return Number.isInteger(value) ? value : value.toFixed(3);
  }

  inputRenderer(params: any) {
    return `<span style="color: green; font-weight: bold">${params.value}</span>`
  }

  onAdd() {
    const dialogRef = this.dialog.open(CreateNoteComponent, {
      data: { note: this.note, tickerNames: this.tickerNames },
      width: '650px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result?.tickerControl || !result?.dateControl) {
        return;
      }

      const data = {
        collection: this.selectedTab?.replace(' ', '_'),
        id: -1,
        ticker: result.tickerControl,
        date: result.dateControl,
        total_rat: result.feesControl,
        op: result.opControl,
        price: result.priceControl,
        qtd: result.quantityControl
      }

      this.brokerageService.updateNote(data).subscribe(res => {
        console.log('brokerage note added successfully.');
      })
      this.selectedData = undefined;
      this.gridComponent.ensureRowIndexIsVisible(this.lastSelectedRownIndex);
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(CreateNoteComponent, {
      data: {
        title: 'Edit note',
        note: this.selectedData,
        tickerNames: this.tickerNames
      },
      width: '650px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result?.tickerControl || !result?.dateControl) {
        return;
      }
      const data = {
        collection: this.selectedTab?.replace(' ', '_'),
        id: this.selectedData.id,
        ticker: result.tickerControl,
        date: result.dateControl,
        total_rat: result.feesControl,
        op: result.opControl,
        price: result.priceControl,
        qtd: result.quantityControl
      }

      this.brokerageService.updateNote(data).subscribe(res => {
        console.log('brokerage note updated successfully.');
      })
      this.selectedData = undefined;
    });
  }

  onRenameTicker() {
    const dialogRef = this.dialog.open(RenameTickerComponent, {
      data: {
        tickerNames: this.tickerNames,
        selectedTicker: this.selectedData?.ticker
      },
      width: '650px',
      maxWidth: '95vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result.oldTicker || !result.newTicker) {
        return;
      }

      const collectionName = this.selectedTab?.replace(' ', '_');
      this.brokerageService.updateTickerName(result.oldTicker, result.newTicker, collectionName).subscribe(res => {
        console.log('brokerage ticker renamed successfully.');
      });

      this.selectedData = undefined;
    });
  }

  onDelete() {
    const collectioName = this.selectedTab?.replace(' ', '_');
    const id = this.selectedData.id;

    this.brokerageService.deleteNote(id, collectioName).subscribe(res => {
      console.log('brokerage note deleted successfully.');
    })
    this.selectedData = undefined;
  }

  onRowSelected(event: RowSelectedEvent) {
    this.selectedData = event.node.data;
    this.lastSelectedRownIndex = event.rowIndex || -1;
  }

  onGridReady(event: GridReadyEvent<any>) {
    if (this.lastSelectedRownIndex === -1)
      return;

    event.api.ensureIndexVisible(this.lastSelectedRownIndex, "middle");
  }
}
