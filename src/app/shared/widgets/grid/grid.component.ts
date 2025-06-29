import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  RowSelectedEvent,
  GridReadyEvent,
  SelectionChangedEvent,
  GridApi
} from 'ag-grid-community'; // Column Definition Type Interface
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

@Component({
  selector: 'app-widget-grid',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss'
})

export class GridComponent {
  @Input() data: any[] | undefined = [];
  @Input() colDefs: ColDef[] = [];

  @Output() gridReady = new EventEmitter();
  @Output() rowSelected = new EventEmitter();

  themeClass = "ag-theme-quartz";
  
  private gridApi: GridApi;

  onGridReady(event: GridReadyEvent<any>) {
    this.gridApi = event.api;
    this.gridReady.emit(event);
  }

  onRowSelected(event: RowSelectedEvent) {
    if(event.node.isSelected()) {
      this.rowSelected.emit(event);
    }
  }

  onSelectionChanged(event: SelectionChangedEvent) {
    var rowCount = event.api.getSelectedNodes().length;
    console.log('selection changed, ' + rowCount + ' rows selected');
  }

  ensureRowIndexIsVisible(index: number) {
    this.gridApi.ensureIndexVisible(index, "middle");
    const node = this.gridApi.getDisplayedRowAtIndex(index);
    node?.setSelected(true);
  }

  api() {
    return this.gridApi;
  }

}
