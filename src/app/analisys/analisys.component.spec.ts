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

@Component({ selector: 'app-scheduled-reports', standalone: true, template: '' })
class MockScheduledReportsComponent { @Input() assetType: any; }

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

  const mockFiagroSets: AnalysisSet<any>[] = [
    { name: 'analysis_br_fiagros_agro', analisys: [{ ticker: 'KFOF11', price: 9.5, grades: 7 }] }
  ];

  const analysisServiceMock = {
    shareAnalysis$: of(mockShareSets),
    reitAnalysis$: of(mockReitSets),
    getCriteria: () => of({}),
    getFiagroAnalysis: jest.fn(() => of(mockFiagroSets)),
    getWatchlist: jest.fn(() => of([]))
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AnalisysComponent],
    })
    .overrideComponent(AnalisysComponent, {
      set: {
        imports: [
          CommonModule,
          MockGridComponent,
          MockRecommendationsComponent,
          MockAssetTypeSelectorComponent,
          MockLoadingBarComponent,
          MockScheduledReportsComponent
        ],
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

  describe('compound selection and origin support', () => {
    beforeEach(() => {
      component.activeCriteria = {
        'SHARE': {
          'BR': {
            'pl': { min: 0, max: 10, unit: 'number' }
          },
          'USA': {
            'pl': { min: 0, max: 15, unit: 'number' }
          }
        }
      };
    });

    it('should parse simple and compound selections correctly', () => {
      expect(component.parseAssetSelection('BR_SHARE')).toEqual({ origin: 'BR', type: 'SHARE' });
      expect(component.parseAssetSelection('USA_REIT')).toEqual({ origin: 'USA', type: 'REIT' });
      expect(component.parseAssetSelection('SHARE')).toEqual({ origin: 'BR', type: 'SHARE' });
      expect(component.parseAssetSelection('ETF')).toEqual({ origin: 'USA', type: 'ETF' });
    });

    it('should parse BR_FIAGRO correctly', () => {
      expect(component.parseAssetSelection('BR_FIAGRO')).toEqual({ origin: 'BR', type: 'FIAGRO' });
    });

    it('should evaluate failsCriteria using USA origin criteria', () => {
      component.selectedTab = 'USA_SHARE';
      // For USA_SHARE, pl max is 15. Value 12 should pass.
      expect(component.failsCriteria('pl', 12)).toBe(false);
      // Value 18 should fail.
      expect(component.failsCriteria('pl', 18)).toBe(true);
    });

    it('should return correct selectedType and selectedOrigin getters', () => {
      component.selectedTab = 'USA_REIT';
      expect(component.selectedType).toBe('REIT');
      expect(component.selectedOrigin).toBe('USA');
    });

    it('should return FIAGRO type and BR origin for BR_FIAGRO', () => {
      component.selectedTab = 'BR_FIAGRO';
      expect(component.selectedType).toBe('FIAGRO');
      expect(component.selectedOrigin).toBe('BR');
    });
  });

  describe('assetTypeOptions includes BR_FIAGRO', () => {
    it('should include BR FIAGROs option', () => {
      const fiagro = component.assetTypeOptions.find(o => o.value === 'BR_FIAGRO');
      expect(fiagro).toBeDefined();
      expect(fiagro?.label).toBe('BR FIAGROs');
    });
  });

  describe('FIAGRO column defs', () => {
    it('should have colFiagroDefs defined', () => {
      expect(component.colFiagroDefs).toBeDefined();
      expect(component.colFiagroDefs.length).toBeGreaterThan(0);
    });

    it('should include ticker as pinned left column', () => {
      const tickerCol = component.colFiagroDefs.find(c => c.field === 'ticker');
      expect(tickerCol).toBeDefined();
      expect(tickerCol?.pinned).toBe('left');
    });

    it('should include all required FIAGRO fields', () => {
      const fields = component.colFiagroDefs.map(c => c.field);
      expect(fields).toContain('ticker');
      expect(fields).toContain('price');
      expect(fields).toContain('price_limit');
      expect(fields).toContain('pvp');
      expect(fields).toContain('dy');
      expect(fields).toContain('last_div');
      expect(fields).toContain('liqday');
      expect(fields).toContain('cd3y');
      expect(fields).toContain('c3y');
      expect(fields).toContain('patr');
      expect(fields).toContain('shareholders');
      expect(fields).toContain('management');
      expect(fields).toContain('grades');
      expect(fields).toContain('mean_price');
      expect(fields).toContain('to_buy');
      expect(fields).toContain('to_equalize');
    });
  });

  describe('FIAGRO dispatch in switchMap', () => {
    it('should use FIAGRO column defs when BR_FIAGRO selected', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onAssetTypeChange('BR_FIAGRO');
      tick();

      expect(component.currentColDefs).toBe(component.colFiagroDefs);
    }));

    it('should call getFiagroAnalysis when BR_FIAGRO selected', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onAssetTypeChange('BR_FIAGRO');
      tick();

      expect(analysisServiceMock.getFiagroAnalysis).toHaveBeenCalledWith('BR');
    }));

    it('should load FIAGRO sets when BR_FIAGRO selected', fakeAsync(() => {
      component.ngOnInit();
      component.analysisSets$.subscribe();
      tick();

      component.onAssetTypeChange('BR_FIAGRO');
      tick();

      expect(component.analysisSets).toEqual(mockFiagroSets);
      expect(component.selectedSetData).toEqual(mockFiagroSets[0].analisys);
    }));
  });

  describe('filteredTickers getter', () => {
    it('should return empty array if analysisSets is empty or null', () => {
      component.analysisSets = [];
      expect(component.filteredTickers).toEqual([]);
    });

    it('should extract tickers from first / AllCheaps set', () => {
      component.analysisSets = [
        { name: 'SHARE_BR__AllCheaps', analisys: [{ ticker: 'WEGE3' }, { ticker: 'VALE3' }] },
        { name: 'SHARE_BR__MyCheap', analisys: [{ ticker: 'PETR4' }] }
      ];
      expect(component.filteredTickers).toEqual(['WEGE3', 'VALE3']);
    });
  });

  describe('Brazilian watchlist and scheduled report mappings', () => {
    it('maps BR shares to the scheduler watchlist and STOCK reports', () => {
      component.selectedTab = 'BR_SHARE';
      expect(component.currentCollection).toBe('BR_SHARES');
      expect(component.scheduledReportAssetType).toBe('STOCK');
    });

    it('maps BR REITs to the scheduler watchlist and FII reports', () => {
      component.selectedTab = 'BR_REIT';
      expect(component.currentCollection).toBe('BR_REITS');
      expect(component.scheduledReportAssetType).toBe('FII');
    });

    it('maps BR FIAGROs to the scheduler watchlist and FIAGRO reports', () => {
      component.selectedTab = 'BR_FIAGRO';
      expect(component.currentCollection).toBe('BR_FIAGROS');
      expect(component.scheduledReportAssetType).toBe('FIAGRO');
    });

    it('does not show scheduled reports for foreign asset classes', () => {
      component.selectedTab = 'USA_SHARE';
      expect(component.scheduledReportAssetType).toBeNull();
    });
  });
});
