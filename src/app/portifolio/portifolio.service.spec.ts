import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortifolioService } from './portifolio.service';
import { Portifolio } from './portifolio';

describe('PortifolioService', () => {
  let service: PortifolioService;
  let httpMock: HttpTestingController;

  const mockPortfolios: Portifolio[] = [
    {
      name: 'acoes',
      assets: [
        { ticker: 'PETR4', amount: 100, cost: 3550, mean_price: 35.5, price: 38.0, market_value: 3800, unrealized_gain: 250, sector: 'Energy', subsector: 'Oil' }
      ],
      metrics: { total_value: 3800, cost: 3550, unrealized_gain: 250, realized_gain: 0, gain: 250, last_dividends: 50 }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PortifolioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch portfolio data via GET', () => {
    service.portifolio$.subscribe(data => {
      expect(data).toEqual(mockPortfolios);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('acoes');
    });

    const req = httpMock.expectOne('http://localhost:8000/portifolio');
    expect(req.request.method).toBe('GET');
    req.flush(mockPortfolios);
  });

  it('should handle server error', () => {
    service.portifolio$.subscribe({
      error: (err) => {
        expect(err).toContain('Backend returned code 404');
      }
    });

    const req = httpMock.expectOne('http://localhost:8000/portifolio');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle client-side error', () => {
    service.portifolio$.subscribe({
      error: (err) => {
        expect(err).toContain('An error occurred:');
      }
    });

    const req = httpMock.expectOne('http://localhost:8000/portifolio');
    req.error(new ProgressEvent('Network error'));
  });
});
