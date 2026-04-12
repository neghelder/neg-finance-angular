import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrokerageHistoryComponent } from './brokerage-history.component';
import { BrokerageService } from '../brokerage.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { BrokerageCollection } from '../brokerage';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CommonModule } from '@angular/common';

// Stub child components
@Component({ selector: 'app-widget-grid', standalone: true, template: '' })
class MockGridComponent {
  @Input() data: any;
  @Input() colDefs: any;
  @Output() gridReady = new EventEmitter();
  @Output() rowSelected = new EventEmitter();
  ensureRowIndexIsVisible = jest.fn();
}

@Component({ selector: 'app-asset-type-selector', standalone: true, template: '' })
class MockAssetTypeSelectorComponent {
  @Input() options: any;
  @Input() selectedValue: any;
  @Output() selectionChange = new EventEmitter();
}

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent {
  @Input() loading: boolean = false;
}

import { MatIconModule } from '@angular/material/icon';

// ... (other mock components)

describe('BrokerageHistoryComponent', () => {
  let component: BrokerageHistoryComponent;
  let fixture: ComponentFixture<BrokerageHistoryComponent>;
  let brokerageService: jest.Mocked<Partial<BrokerageService>>;
  let dialog: jest.Mocked<Partial<MatDialog>>;

  const mockCollections: BrokerageCollection[] = [
    {
      name: 'acoes',
      notes: [
        { ticker: 'PETR4', date: '01/01/2024', op: 'C', qtd: 100, price: 35.5, total_rat: 0.5, amount: 100 },
        { ticker: 'VALE3', date: '02/01/2024', op: 'C', qtd: 50, price: 70.0, total_rat: 0.3, amount: 50 },
        { ticker: 'PETR4', date: '03/01/2024', op: 'V', qtd: 100, price: 38.0, total_rat: 0.4, amount: 0 }
      ]
    },
    {
      name: 'fiis',
      notes: [
        { ticker: 'HGLG11', date: '05/01/2024', op: 'C', qtd: 10, price: 160.0, total_rat: 0.3, amount: 10 }
      ]
    }
  ];

  const brokerageHistorySubject = new BehaviorSubject<BrokerageCollection[]>(mockCollections);

  beforeEach(async () => {
    brokerageService = {
      brokerageHistory$: brokerageHistorySubject.asObservable(),
      updateNote: jest.fn().mockReturnValue(of({})),
      deleteNote: jest.fn().mockReturnValue(of({})),
      updateTickerName: jest.fn().mockReturnValue(of({}))
    };

    dialog = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BrokerageHistoryComponent, NoopAnimationsModule],
    })
    .overrideComponent(BrokerageHistoryComponent, {
      set: {
        imports: [CommonModule, MatIconModule, MockGridComponent, MockAssetTypeSelectorComponent, MockLoadingBarComponent],
        providers: [
          { provide: BrokerageService, useValue: brokerageService },
          { provide: MatDialog, useValue: dialog }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrokerageHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('auto-select on load', () => {
    it('should auto-select first collection when data loads', fakeAsync(() => {
      // Subscribe to trigger the tap
      component.brokerageCollection$.subscribe();
      tick();

      expect(component.selectedAssetType).toBe('acoes');
      expect(component.selectedTab).toBe('acoes');
      expect(component.selectedNotes).toEqual(mockCollections[0].notes);
      expect(component.loading).toBe(false);
    }));

    it('should build asset type options from collections', fakeAsync(() => {
      component.brokerageCollection$.subscribe();
      tick();

      expect(component.assetTypeOptions).toEqual([
        { label: 'acoes', value: 'acoes' },
        { label: 'fiis', value: 'fiis' }
      ]);
    }));

    it('should filter ticker names with positive amount and deduplicate', fakeAsync(() => {
      component.brokerageCollection$.subscribe();
      tick();

      // PETR4 has amount 0 in its latest note, so it should not be listed
      expect(component.tickerNames).toEqual(['VALE3']);
    }));
  });

  describe('onAssetTypeChange', () => {
    it('should update selected asset type and notes', fakeAsync(() => {
      component.brokerageCollection$.subscribe();
      tick();

      component.onAssetTypeChange('fiis');
      expect(component.selectedAssetType).toBe('fiis');
      expect(component.selectedTab).toBe('fiis');
      expect(component.selectedNotes).toEqual(mockCollections[1].notes);
      expect(component.selectedData).toBeUndefined();
    }));
  });

  describe('onRowSelected', () => {
    it('should set selectedData and lastSelectedRownIndex', () => {
      const mockEvent = {
        node: { data: { ticker: 'PETR4', id: 1 } },
        rowIndex: 5
      } as any;

      component.onRowSelected(mockEvent);
      expect(component.selectedData).toEqual({ ticker: 'PETR4', id: 1 });
      expect(component.lastSelectedRownIndex).toBe(5);
    });

    it('should set rowIndex to -1 when rowIndex is undefined', () => {
      const mockEvent = {
        node: { data: { ticker: 'PETR4' } },
        rowIndex: undefined
      } as any;

      component.onRowSelected(mockEvent);
      expect(component.lastSelectedRownIndex).toBe(-1);
    });
  });

  describe('numberRenderer', () => {
    it('should return integer for whole numbers', () => {
      expect(component.numberRenderer({ value: 42 })).toBe(42);
    });

    it('should return 3 decimal places for non-integers', () => {
      expect(component.numberRenderer({ value: 3.14159 })).toBe('3.142');
    });
  });

  describe('inputRenderer', () => {
    it('should return green bold span HTML', () => {
      const result = component.inputRenderer({ value: 'PETR4' });
      expect(result).toContain('color: green');
      expect(result).toContain('font-weight: bold');
      expect(result).toContain('PETR4');
    });
  });

  describe('CRUD operations', () => {
    beforeEach(fakeAsync(() => {
      component.brokerageCollection$.subscribe();
      tick();
    }));

    describe('onAdd', () => {
      it('should call updateNote with id -1 when dialog returns valid result', fakeAsync(() => {
        const dialogResult = {
          tickerControl: 'VALE3',
          dateControl: '15/03/2024',
          feesControl: 0.5,
          opControl: 'C',
          priceControl: 70,
          quantityControl: 50
        };
        const dialogRef = { afterClosed: () => of(dialogResult) } as any;
        (dialog.open as jest.Mock).mockReturnValue(dialogRef);

        component.gridComponent = { ensureRowIndexIsVisible: jest.fn() } as any;
        component.onAdd();

        expect(brokerageService.updateNote).toHaveBeenCalledWith(expect.objectContaining({
          id: -1,
          ticker: 'VALE3',
          collection: 'acoes'
        }));
      }));

      it('should not call updateNote when dialog is cancelled', fakeAsync(() => {
        const dialogRef = { afterClosed: () => of(undefined) } as any;
        (dialog.open as jest.Mock).mockReturnValue(dialogRef);

        component.onAdd();

        expect(brokerageService.updateNote).not.toHaveBeenCalled();
      }));
    });

    describe('onEdit', () => {
      it('should call updateNote with selected note id', fakeAsync(() => {
        component.selectedData = { id: 42, ticker: 'PETR4' };
        const dialogResult = {
          tickerControl: 'PETR4',
          dateControl: '15/03/2024',
          feesControl: 0.5,
          opControl: 'C',
          priceControl: 70,
          quantityControl: 100
        };
        const dialogRef = { afterClosed: () => of(dialogResult) } as any;
        (dialog.open as jest.Mock).mockReturnValue(dialogRef);

        component.onEdit();

        expect(brokerageService.updateNote).toHaveBeenCalledWith(expect.objectContaining({
          id: 42,
          ticker: 'PETR4'
        }));
      }));
    });

    describe('onRenameTicker', () => {
      it('should call updateTickerName when dialog returns valid result', fakeAsync(() => {
        const dialogResult = {
          oldTicker: 'VALE3',
          newTicker: 'VALE4'
        };
        const dialogRef = { afterClosed: () => of(dialogResult) } as any;
        (dialog.open as jest.Mock).mockReturnValue(dialogRef);

        component.onRenameTicker();

        expect(brokerageService.updateTickerName).toHaveBeenCalledWith('VALE3', 'VALE4', 'acoes');
      }));
    });

    describe('onDelete', () => {
      it('should call deleteNote with selected note id and collection', fakeAsync(() => {
        component.selectedData = { id: 42 };

        component.onDelete();

        expect(brokerageService.deleteNote).toHaveBeenCalledWith(42, 'acoes');
        expect(component.selectedData).toBeUndefined();
      }));
    });
  });

  describe('onGridReady', () => {
    it('should not call ensureIndexVisible when lastSelectedRownIndex is -1', () => {
      const mockApi = { ensureIndexVisible: jest.fn() };
      const mockEvent = { api: mockApi } as any;

      component.lastSelectedRownIndex = -1;
      component.onGridReady(mockEvent);

      expect(mockApi.ensureIndexVisible).not.toHaveBeenCalled();
    });

    it('should call ensureIndexVisible when lastSelectedRownIndex is valid', () => {
      const mockApi = { ensureIndexVisible: jest.fn() };
      const mockEvent = { api: mockApi } as any;

      component.lastSelectedRownIndex = 5;
      component.onGridReady(mockEvent);

      expect(mockApi.ensureIndexVisible).toHaveBeenCalledWith(5, 'middle');
    });
  });
});
