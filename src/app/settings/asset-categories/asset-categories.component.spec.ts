import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AssetCategoriesComponent } from './asset-categories.component';
import { AssetCatalogService } from '../asset-catalog.service';

describe('AssetCategoriesComponent', () => {
  let component: AssetCategoriesComponent;
  let fixture: ComponentFixture<AssetCategoriesComponent>;
  const catalog = {
    getMarkets: jest.fn(() => of([{ code: 'BR', label: 'Brasil', currency_code: 'BRL', active: true }])),
    getTypes: jest.fn(() => of([{ code: 'FIAGRO', label: 'FIAGROs', collection_suffix: 'FIAGROS' }])),
    getCategories: jest.fn(() => of([])),
    createMarket: jest.fn(() => of({})),
    createCategory: jest.fn(() => of({})),
    archiveCategory: jest.fn(() => of(undefined))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCategoriesComponent, NoopAnimationsModule],
      providers: [{ provide: AssetCatalogService, useValue: catalog }]
    }).compileComponents();

    fixture = TestBed.createComponent(AssetCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the catalog configuration on startup', () => {
    expect(component.markets).toEqual([expect.objectContaining({ code: 'BR' })]);
    expect(component.types).toEqual([expect.objectContaining({ code: 'FIAGRO' })]);
    expect(catalog.getCategories).toHaveBeenCalled();
  });

  it('creates a market and refreshes the catalog', () => {
    component.market = { code: 'CN', label: 'China', currency_code: 'CNY' };
    component.createMarket();

    expect(catalog.createMarket).toHaveBeenCalledWith({ code: 'CN', label: 'China', currency_code: 'CNY' });
    expect(component.market).toEqual({ code: '', label: '', currency_code: '' });
  });

  it('uses the themed market and asset-type selects when creating a category', () => {
    const marketSelect = fixture.nativeElement.querySelector('#category-market') as HTMLSelectElement;
    const typeSelect = fixture.nativeElement.querySelector('#category-asset-type') as HTMLSelectElement;

    marketSelect.value = 'BR';
    marketSelect.dispatchEvent(new Event('change'));
    typeSelect.value = 'FIAGRO';
    typeSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    component.category.label = 'FIAGRO Brasil';
    component.createCategory();

    expect(marketSelect.classList.contains('theme-select')).toBe(true);
    expect(typeSelect.classList.contains('theme-select')).toBe(true);
    expect(catalog.createCategory).toHaveBeenCalledWith({
      market_code: 'BR', asset_type_code: 'FIAGRO', label: 'FIAGRO Brasil'
    });
  });
});
