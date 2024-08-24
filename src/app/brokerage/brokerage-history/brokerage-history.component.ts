import { Component } from '@angular/core';
import { BrokerageService } from '../brokerage.service';
import { ColDef, RowSelectedEvent } from 'ag-grid-community';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { GridComponent } from '../../shared/widgets/grid/grid.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CreateNoteComponent } from './create-note/create-note.component';
import { Note } from '../brokerage';

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

  brokerageCollection$ = this.brokerageService.brokerageHistory$;
  selectedData: any = undefined;
  note: Note = {
    ticker: '',
    date: '',
    op: 'C',
    price: 0,
    qtd: 0,
    total_rat: 0
  };
  selectedTab: string;

  constructor(private brokerageService: BrokerageService, public dialog: MatDialog) {}

  numberRenderer(params: any) {
    return `${params.value}`;
  }

  inputRenderer(params: any) {
    return `<span style="color: green; font-weight: bold">${params.value}</span>`
  }

  onAdd() {
    const dialogRef = this.dialog.open(CreateNoteComponent, {
      data: { note: this.note},
      height: '50%',
      width: '55%',
    });

    dialogRef.afterClosed().subscribe(result => {
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
      
      this.brokerageService.addNote(data).subscribe(res => {
        console.log(res);
      })
      this.selectedData = undefined;
    });
  }

  onEdit() {
    const dialogRef = this.dialog.open(CreateNoteComponent, {
      data: { title: 'Editar nota', note: this.selectedData },
      height: '50%',
      width: '55%',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.selectedData = undefined;
    });
  }

  onDelete() {
  }

  onRowSelected(event: RowSelectedEvent) {
    this.selectedData = event.node.data;
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTab = event.tab.textLabel;
  }
}
