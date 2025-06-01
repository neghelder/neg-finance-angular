import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { BrokerageService } from '../brokerage.service';
import { ColDef, GridReadyEvent, RowSelectedEvent } from 'ag-grid-community';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { GridComponent } from '../../shared/widgets/grid/grid.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreateNoteComponent } from './create-note/create-note.component';
import { BrokerageCollection, Note } from '../brokerage';
import { map, Observable, tap } from 'rxjs';

@Component({
  selector: 'app-brokerage-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    GridComponent,
    MatButtonModule,
    MatIconModule,
    MatIconModule,
    AsyncPipe
  ],
  templateUrl: './brokerage-history.component.html',
  styleUrl: './brokerage-history.component.scss'
})

export class BrokerageHistoryComponent {

  colDefs: ColDef[] = [
    { field: 'date', headerName: 'Data', width: 115, cellRenderer: this.inputRenderer },
    { field: 'ticker', headerName: 'Papel', width: 100, cellRenderer: this.inputRenderer },
    { field: 'op', headerName: 'OP', width: 60, cellRenderer: this.inputRenderer},
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

  brokerageCollection$: Observable<BrokerageCollection[]>;
  tickerNames: string[];  // New observable for ticker names

  // brokerageCollection$ = this.brokerageService.brokerageHistory$;

  // tickerNames$ = this.brokerageCollection$.pipe(
  //   tap(collections => console.log(collections)), 
  //   map(collections => collections.map(item => item.name)), // Extract ticker names
  //   distinctUntilChanged()  // Ensures that updates are emitted only when tickers actually change
  // );

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
  selectedTab: string;
  selectedTabIndex = -1;

  @ViewChild(GridComponent) gridComponent: GridComponent;
  @ViewChildren(GridComponent) grids!: QueryList<GridComponent>;
  private gridApi!: any;

  constructor(private brokerageService: BrokerageService, public dialog: MatDialog) {
    this.brokerageCollection$ = this.brokerageService.brokerageHistory$;
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
      data: { note: this.note, tickerNames : this.tickerNames},
      height: '50%',
      width: '55%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result || !result?.tickerControl || !result?.dateControl) {
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
      data: { title: 'Editar nota', 
        note: this.selectedData, 
        tickerNames : this.tickerNames 
      },
      height: '50%',
      width: '55%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!result || !result?.tickerControl || !result?.dateControl) {
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
    if(this.lastSelectedRownIndex === -1)
      return;

    event.api.ensureIndexVisible(this.lastSelectedRownIndex, "middle");
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTab = event.tab.textLabel;
    this.selectedTabIndex = event.index;

    this.brokerageService.brokerageHistory$.pipe(
      map(collections => collections.filter(collection => collection.name === this.selectedTab.replace(' ', '_'))[0]?.notes.map(value => value.ticker).filter((value, index, self) => self.indexOf(value) === index)), 
    ).subscribe(tickers => this.tickerNames = tickers);
  }
}
// import {Component} from '@angular/core';
// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatInputModule} from '@angular/material/input';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import {MatNativeDateModule, NativeDateAdapter} from '@angular/material/core';

// /** @title Basic datepicker */
// @Component({
//   selector: 'datepicker-overview-example',
//   templateUrl: 'brokerage-history.component.html',
//   standalone: true,
//   providers: [NativeDateAdapter],
//   imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
// })
// export class BrokerageHistoryComponent {}
