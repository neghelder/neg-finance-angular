import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PortifolioComponent } from './portifolio.component';
import { PortifolioService } from './portifolio.service';
import { of } from 'rxjs';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Portifolio } from './portifolio';

import { CommonModule } from '@angular/common';

// Stub child components
@Component({ selector: 'app-widget-grid', standalone: true, template: '' })
class MockGridComponent { @Input() data: any; @Input() colDefs: any; }

@Component({ selector: 'app-widget-pie', standalone: true, template: '' })
class MockPieComponent { @Input() title: any; @Input() subtitle: any; @Input() data: any; }

@Component({ selector: 'app-asset-type-selector', standalone: true, template: '' })
class MockAssetTypeSelectorComponent { @Input() options: any; @Input() selectedValue: any; @Output() selectionChange = new EventEmitter(); }

@Component({ selector: 'app-loading-bar', standalone: true, template: '' })
class MockLoadingBarComponent { @Input() loading: boolean = false; }

describe('PortifolioComponent', () => {
  let component: PortifolioComponent;
  let fixture: ComponentFixture<PortifolioComponent>;

  const mockPortfolios: Portifolio[] = [
    {
      name: 'acoes',
      assets: [
        { ticker: 'PETR4', amount: 100, cost: 3550, mean_price: 35.5, price: 38.0, market_value: 3800, unrealized_gain: 250, sector: 'Energy', subsector: 'Oil' },
        { ticker: 'VALE3', amount: 50, cost: 3500, mean_price: 70.0, price: 72.0, market_value: 3600, unrealized_gain: 100, sector: 'Mining', subsector: 'Iron' },
        { ticker: 'BBDC4', amount: 200, cost: 4000, mean_price: 20.0, price: 22.0, market_value: 4400, unrealized_gain: 400, sector: 'Finance', subsector: 'Banks' }
      ],
      metrics: { total_value: 11800, cost: 11050, unrealized_gain: 750, realized_gain: 0, gain: 750, last_dividends: 150 }
    },
    {
      name: 'fiis',
      assets: [
        { ticker: 'HGLG11', amount: 10, cost: 1600, mean_price: 160.0, price: 165.0, market_value: 1650, unrealized_gain: 50, sector: 'Logistics', subsector: 'Warehouses' }
      ],
      metrics: { total_value: 1650, cost: 1600, unrealized_gain: 50, realized_gain: 0, gain: 50, last_dividends: 30 }
    }
  ];

  const portifolioServiceMock = {
    portifolio$: of(mockPortfolios)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortifolioComponent],
    })
    .overrideComponent(PortifolioComponent, {
      set: {
        imports: [CommonModule, MockGridComponent, MockPieComponent, MockAssetTypeSelectorComponent, MockLoadingBarComponent],
        providers: [
          { provide: PortifolioService, useValue: portifolioServiceMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortifolioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should auto-select first portfolio on load', fakeAsync(() => {
    component.portifolio$.subscribe();
    tick();

    expect(component.selectedAssetType).toBe('acoes');
    expect(component.selectedPortfolio).toEqual(mockPortfolios[0]);
    expect(component.loading).toBe(false);
  }));

  it('should build assetTypeOptions from portfolios', fakeAsync(() => {
    component.portifolio$.subscribe();
    tick();

    expect(component.assetTypeOptions).toEqual([
      { label: 'acoes', value: 'acoes' },
      { label: 'fiis', value: 'fiis' }
    ]);
  }));

  it('should build pie chart data with ByPosition, BySector, BySubSector', fakeAsync(() => {
    component.portifolio$.subscribe();
    tick();

    const acoesData = component.pieChartData.get('acoes');
    expect(acoesData).toBeDefined();

    // ByPosition: 3 assets
    const positions = acoesData!.get('ByPosition');
    expect(positions!.length).toBe(3);
    expect(positions![0]).toEqual({ name: 'PETR4', y: 3800 });

    // BySector: 3 unique sectors
    const sectors = acoesData!.get('BySector');
    expect(sectors!.length).toBe(3);

    // BySubSector: 3 unique subsectors
    const subsectors = acoesData!.get('BySubSector');
    expect(subsectors!.length).toBe(3);
  }));

  describe('onAssetTypeChange', () => {
    it('should update selectedPortfolio when changing asset type', fakeAsync(() => {
      component.portifolio$.subscribe();
      tick();

      component.onAssetTypeChange('fiis');
      expect(component.selectedAssetType).toBe('fiis');
      expect(component.selectedPortfolio).toEqual(mockPortfolios[1]);
    }));

    it('should set selectedPortfolio to null for unknown asset type', fakeAsync(() => {
      component.portifolio$.subscribe();
      tick();

      component.onAssetTypeChange('unknown');
      expect(component.selectedPortfolio).toBeNull();
    }));
  });

  describe('customPriceRenderer', () => {
    it('should format positive values in green', () => {
      const result = component.customPriceRenderer({ value: 10.5 });
      expect(result).toContain('color: green');
      expect(result).toContain('$10.50');
    });

    it('should format negative values in red', () => {
      const result = component.customPriceRenderer({ value: -5.3 });
      expect(result).toContain('color: red');
      expect(result).toContain('$-5.30');
    });
  });
});
