import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AssetCatalogService } from './asset-catalog.service';

describe('AssetCatalogService', () => {
  let service: AssetCatalogService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AssetCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists analysis-capable categories', () => {
    service.getCategories('ANALYSIS').subscribe();
    const request = http.expectOne('http://localhost:8000/asset-catalog/categories?include_archived=false&capability=ANALYSIS');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a market and enables a brokerage category', () => {
    service.createMarket({ code: 'CN', label: 'China', currency_code: 'CNY' }).subscribe();
    const market = http.expectOne('http://localhost:8000/asset-catalog/markets');
    expect(market.request.method).toBe('POST');
    expect(market.request.body).toEqual({ code: 'CN', label: 'China', currency_code: 'CNY' });
    market.flush({ code: 'CN', label: 'China', currency_code: 'CNY', active: true });

    service.enableBrokerageCategory('BR_FIAGROS').subscribe();
    const enable = http.expectOne('http://localhost:8000/brokerage/categories/BR_FIAGROS');
    expect(enable.request.method).toBe('PUT');
    enable.flush({ code: 'BR_FIAGROS' });
  });
});
