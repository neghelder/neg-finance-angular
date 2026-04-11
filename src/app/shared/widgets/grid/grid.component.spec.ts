import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridComponent } from './grid.component';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';

@Component({ selector: 'ag-grid-angular', standalone: true, template: '' })
class MockAgGridAngular {
  @Input() rowData: any;
  @Input() columnDefs: any;
  @Input() class: any;
  @Input() rowSelection: any;
  @Output() rowSelected = new EventEmitter();
  @Output() gridReady = new EventEmitter();
}

describe('GridComponent', () => {
  let component: GridComponent;
  let fixture: ComponentFixture<GridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridComponent],
    })
    .overrideComponent(GridComponent, {
      remove: { imports: [AgGridAngular] },
      add: { imports: [MockAgGridAngular] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default empty data and colDefs', () => {
    expect(component.data).toEqual([]);
    expect(component.colDefs).toEqual([]);
  });

  it('should use ag-theme-quartz', () => {
    expect(component.themeClass).toBe('ag-theme-quartz');
  });

  describe('onRowSelected', () => {
    it('should emit rowSelected when node is selected', () => {
      const spy = jest.spyOn(component.rowSelected, 'emit');
      const mockEvent = { node: { isSelected: () => true, data: { ticker: 'PETR4' } } } as any;

      component.onRowSelected(mockEvent);

      expect(spy).toHaveBeenCalledWith(mockEvent);
    });

    it('should not emit rowSelected when node is deselected', () => {
      const spy = jest.spyOn(component.rowSelected, 'emit');
      const mockEvent = { node: { isSelected: () => false } } as any;

      component.onRowSelected(mockEvent);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('onGridReady', () => {
    it('should store gridApi and emit gridReady', () => {
      const spy = jest.spyOn(component.gridReady, 'emit');
      const mockApi = { ensureIndexVisible: jest.fn() };
      const mockEvent = { api: mockApi } as any;

      component.onGridReady(mockEvent);

      expect(spy).toHaveBeenCalledWith(mockEvent);
      expect(component.api()).toBe(mockApi);
    });
  });

  describe('ensureRowIndexIsVisible', () => {
    it('should call gridApi.ensureIndexVisible and select the row', () => {
      const mockNode = { setSelected: jest.fn() };
      const mockApi = {
        ensureIndexVisible: jest.fn(),
        getDisplayedRowAtIndex: jest.fn().mockReturnValue(mockNode)
      };
      // Set up the grid API
      component.onGridReady({ api: mockApi } as any);

      component.ensureRowIndexIsVisible(5);

      expect(mockApi.ensureIndexVisible).toHaveBeenCalledWith(5, 'middle');
      expect(mockApi.getDisplayedRowAtIndex).toHaveBeenCalledWith(5);
      expect(mockNode.setSelected).toHaveBeenCalledWith(true);
    });
  });
});
