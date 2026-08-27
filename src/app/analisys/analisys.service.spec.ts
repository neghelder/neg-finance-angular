import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalisysService } from './analisys.service';

describe('AnalisysService', () => {
  let service: AnalisysService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AnalisysService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shareAnalysis$', () => {
    it('should fetch share analysis data via GET', () => {
      const mockData = [{ name: 'analysis_br_shares_set1', analisys: [{ ticker: 'PETR4', price: 35.5 }] }];

      service.shareAnalysis$.subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares?origin=BR');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getShareAnalysis', () => {
    it('should fetch share analysis data with origin via GET', () => {
      const mockData = [{ name: 'analysis_usa_shares_set1', analisys: [{ ticker: 'AAPL', price: 175.5 }] }];

      service.getShareAnalysis('USA').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares?origin=USA');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('reitAnalysis$', () => {
    it('should fetch REIT analysis data via GET', () => {
      const mockData = [{ name: 'analysis_br_reits_set1', analisys: [{ ticker: 'HGLG11', price: 160.0 }] }];

      service.reitAnalysis$.subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/reits?origin=BR');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getReitAnalysis', () => {
    it('should fetch REIT analysis data with origin via GET', () => {
      const mockData = [{ name: 'analysis_usa_reits_set1', analisys: [{ ticker: 'O', price: 55.0 }] }];

      service.getReitAnalysis('USA').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/reits?origin=USA');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getBuyRecommendations', () => {
    it('should fetch buy recommendations with correct URL parameters', () => {
      const mockRecs = [
        { ticker: 'PETR4', amount: 3 },
        { ticker: 'total_spent', amount: 950 }
      ];

      service.getBuyRecommendations('share', 'BR', 1000).subscribe(data => {
        expect(data).toEqual(mockRecs);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares/buy-rec?origin=BR&budget=1000');
      expect(req.request.method).toBe('GET');
      req.flush(mockRecs);
    });

    it('should handle server error', () => {
      service.getBuyRecommendations('share', 'BR', 1000).subscribe({
        error: (err) => {
          expect(err).toContain('Backend returned code 500');
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares/buy-rec?origin=BR&budget=1000');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('handleError', () => {
    it('should handle client-side network error', () => {
      service.shareAnalysis$.subscribe({
        error: (err) => {
          expect(err).toContain('An error occurred:');
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares?origin=BR');
      req.error(new ProgressEvent('Network error'));
    });
  });

  describe('getFiagroAnalysis', () => {
    it('should fetch FIAGRO analysis via GET with origin=BR', () => {
      const mockData = [{ name: 'analysis_br_fiagros_set1', analisys: [{ ticker: 'KFOF11', price: 9.5 }] }];

      service.getFiagroAnalysis('BR').subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros?origin=BR');
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should default to origin=BR', () => {
      service.getFiagroAnalysis().subscribe();
      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros?origin=BR');
      req.flush([]);
    });
  });

  describe('getFiagrosBuyRec', () => {
    it('should fetch FIAGRO buy recommendations with correct URL parameters', () => {
      const mockRecs = [{ ticker: 'KFOF11', amount: 10 }];

      service.getFiagrosBuyRec('BR', 500).subscribe(data => {
        expect(data).toEqual(mockRecs);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros/buy-rec?origin=BR&budget=500');
      expect(req.request.method).toBe('GET');
      req.flush(mockRecs);
    });

    it('should handle server error gracefully', () => {
      service.getFiagrosBuyRec('BR', 500).subscribe({
        error: (err) => {
          expect(err).toContain('Backend returned code 500');
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros/buy-rec?origin=BR&budget=500');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getFiagroReports', () => {
    it('should fetch FIAGRO reports with force_refresh=false by default', () => {
      const mockResponse = { status: 'success', eligible_count: 1, results: [] };

      service.getFiagroReports().subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros/reports?force_refresh=false');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should fetch FIAGRO reports with force_refresh=true when specified', () => {
      const mockResponse = { status: 'success', eligible_count: 3, results: [] };

      service.getFiagroReports(true).subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros/reports?force_refresh=true');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle server error for reports endpoint', () => {
      service.getFiagroReports(false).subscribe({
        error: (err) => {
          expect(err).toContain('Backend returned code 500');
        }
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/fiagros/reports?force_refresh=false');
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('criteria API', () => {
    it('should fetch criteria via GET', () => {
      const mockCriteria = { SHARE: { BR: { pl: { max: 10 } } } };

      service.getCriteria().subscribe(criteria => {
        expect(criteria).toEqual(mockCriteria);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/criteria');
      expect(req.request.method).toBe('GET');
      req.flush(mockCriteria);
    });

    it('should update criteria via saveCriteria', () => {
      const criteriaPayload = { SHARE: { BR: { pl: { max: 15 } } } };
      
      service.saveCriteria(criteriaPayload as any).subscribe(criteria => {
        expect(criteria).toEqual(criteriaPayload);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/criteria');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(criteriaPayload);
      req.flush(criteriaPayload);
    });
  });
});
