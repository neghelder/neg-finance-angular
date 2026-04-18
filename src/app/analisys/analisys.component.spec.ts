import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AnalisysComponent } from './analisys.component';
import { AnalisysService } from './analisys.service';
import { of } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AnalysisSet } from './models/analysisSet';

import { CommonModule } from '@angular/common';

// Stub child components
@Component({ selector: 'app-widget-grid', standalone: true, template: '' })
class MockGridComponent { @Input() data: any; @Input() colDefs: any; }

@Component({ selector: 'app-recommendations', standalone: true, template: '' })
class MockRecommendationsComponent { @Input() origin: any; @Input() type: any; }

@Component({ selector: 'app-asset-type-selector', standalone: true, template: '' })
class MockAssetTypeSelectorComponent { @Input() options: any; @Input() selectedValue: any; @Output() selectionChange = new EventEmitter(); }

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent { @Input() loading: boolean = false; }

describe('AnalisysComponent', () => {
  let component: AnalisysComponent;
  let fixture: ComponentFixture<AnalisysComponent>;

  const mockShareSets: AnalysisSet<any>[] = [
    { name: 'analysis_br_shares_value', analisys: [{ ticker: 'PETR4', price: 35.5, grades: 8 }] },
    { name: 'analysis_br_shares_growth', analisys: [{ ticker: 'VALE3', price: 70.0, grades: 7 }] }
  ];

  const mockReitSets: AnalysisSet<any>[] = [
    { name: 'analysis_br_reits_yield', analisys: [{ ticker: 'HGLG11', price: 160.0, grades: 9 }] }
  ];

  const analysisServiceMock = {
    shareAnalysis$: of(mockShareSets),
    reitAnalysis$: of(mockReitSets),
    getCriteria: () => of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalisysComponent],
    })
    .overrideComponent(AnalisysComponent, {
      set: {
        imports: [CommonModule, MockGridComponent, MockRecommendationsComponent, MockAssetTypeSelectorComponent, MockLoadingBarComponent],
        providers: [
          { provide: AnalisysService, useValue: analysisServiceMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisysComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to SHARE tab', () => {
    expect(component.selectedTab).toBe('SHARE');
    expect(component.currentColDefs).toBe(component.colDefs);
  });

  describe('ngOnInit with SHARE', () => {
    it('should load share analysis sets and auto-select first', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      expect(component.analysisSets).toEqual(mockShareSets);
      expect(component.selectedSetIndex).toBe(0);
      expect(component.selectedSetData).toEqual(mockShareSets[0].analisys);
      expect(component.loading).toBe(false);
    }));

    it('should build set labels from names', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      // 'analysis_br_shares_value' -> parts.slice(3) -> ['value']
      expect(component.setLabels).toEqual(['value', 'growth']);
    }));
  });

  describe('onAssetTypeChange', () => {
    it('should switch to REIT column definitions', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onAssetTypeChange('REIT');
      tick();

      expect(component.currentColDefs).toBe(component.colReitsDefs);
    }));
  });

  describe('onSetSelected', () => {
    it('should update selectedSetIndex and selectedSetData', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onSetSelected(1);
      expect(component.selectedSetIndex).toBe(1);
      expect(component.selectedSetData).toEqual(mockShareSets[1].analisys);
    }));

    it('should return empty array for out-of-bounds index', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onSetSelected(99);
      expect(component.selectedSetData).toEqual([]);
    }));
  });

  describe('percentageRenderer', () => {
    it('should format positive percentage', () => {
      const result = component.percentageRenderer({ value: 0.153 });
      expect(result).toContain('15.3%');
    });

    it('should format negative percentage', () => {
      const result = component.percentageRenderer({ value: -0.05 });
      expect(result).toContain('-5.0%');
    });
  });

  describe('currencyFormatter', () => {
    it('should format valid value', () => {
      expect(component.currencyFormatter({ value: 25.5 })).toBe('$ 25.50');
    });

    it('should return N/A for null value', () => {
      expect(component.currencyFormatter({ value: null })).toBe('N/A');
    });

    it('should return N/A for undefined value', () => {
      expect(component.currencyFormatter({ value: undefined })).toBe('N/A');
    });
  });

  describe('largeNumberFormatter', () => {
    it('should abbreviate thousands with K', () => {
      expect(component.largeNumberFormatter({ value: 1500 })).toBe('1.50K');
    });

    it('should abbreviate millions with M', () => {
      expect(component.largeNumberFormatter({ value: 2500000 })).toBe('2.50M');
    });

    it('should abbreviate billions with B', () => {
      expect(component.largeNumberFormatter({ value: 3700000000 })).toBe('3.70B');
    });

    it('should abbreviate trillions with T', () => {
      expect(component.largeNumberFormatter({ value: 1200000000000 })).toBe('1.20T');
    });

    it('should not abbreviate small numbers', () => {
      expect(component.largeNumberFormatter({ value: 999 })).toBe('999');
    });

    it('should return empty string for null', () => {
      expect(component.largeNumberFormatter({ value: null })).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(component.largeNumberFormatter({ value: undefined })).toBe('');
    });
  });

  describe('criteria cell styling', () => {
    beforeEach(() => {
      component.activeCriteria = {
        'SHARE': {
          'BR': {
            'pl': { min: 0, max: 10, unit: 'number' },
            'dy': { min: 0.07, unit: 'perc' }
          }
        }
      };
      component.selectedTab = 'SHARE';
    });

    it('should fail criteria if below min', () => {
      expect(component.failsCriteria('dy', 0.05)).toBe(true);
    });

    it('should fail criteria if above max', () => {
      expect(component.failsCriteria('pl', 15)).toBe(true);
    });

    it('should pass criteria if within bounds', () => {
      expect(component.failsCriteria('pl', 5)).toBe(false);
      expect(component.failsCriteria('dy', 0.08)).toBe(false);
    });

    it('should pass criteria if no rules for field', () => {
      expect(component.failsCriteria('nonexistent', 99)).toBe(false);
    });

    it('should return red and bold cellStyle if fails', () => {
      const result = component.cellStyleFn({ colDef: { field: 'pl' }, value: 15 });
      expect(result).toEqual({ color: 'red', fontWeight: 'bold' });
    });

    it('should return green cellStyle if passes', () => {
      const result = component.cellStyleFn({ colDef: { field: 'pl' }, value: 5 });
      expect(result).toEqual({ color: 'green' });
    });
  });
});
