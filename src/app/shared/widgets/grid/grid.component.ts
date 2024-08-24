import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { 
  ColDef, 
  RowSelectedEvent,
  GridReadyEvent,
  SelectionChangedEvent
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

  // @Output() gridReady = new EventEmitter();
  @Output() rowSelected = new EventEmitter();

  themeClass = "ag-theme-quartz";

  onGridReady(event: GridReadyEvent<any>) {
    // this.data = data;
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

}
