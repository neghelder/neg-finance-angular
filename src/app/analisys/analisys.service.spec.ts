import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AnalisysService, MOCK_CRITERIA } from './analisys.service';

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

  describe('getBuyRecommendations', () => {
    it('should fetch buy recommendations with correct URL parameters', () => {
      const mockRecs = [
        { ticker: 'PETR4', amount: 3 },
        { ticker: 'total_spent', amount: 950 }
      ];

      service.getBuyRecommendations('shares', 'BR', 1000).subscribe(data => {
        expect(data).toEqual(mockRecs);
        expect(data.length).toBe(2);
      });

      const req = httpMock.expectOne('http://localhost:8000/analisys/shares/buy-rec?origin=BR&budget=1000');
      expect(req.request.method).toBe('GET');
      req.flush(mockRecs);
    });

    it('should handle server error', () => {
      service.getBuyRecommendations('shares', 'BR', 1000).subscribe({
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

  describe('criteria API', () => {
    it('should return mock criteria from BehaviorSubject', (done) => {
      service.getCriteria().subscribe(criteria => {
        expect(criteria).toEqual(MOCK_CRITERIA);
        done();
      });
    });

    it('should update criteria via saveCriteria', (done) => {
      const updatedCriteria = JSON.parse(JSON.stringify(MOCK_CRITERIA));
      updatedCriteria['SHARES']['BR']['pl'] = { min: 2, max: 12 };
      
      service.saveCriteria(updatedCriteria).subscribe(() => {
        service.getCriteria().subscribe(criteria => {
          expect(criteria['SHARES']['BR']['pl']).toEqual({ min: 2, max: 12 });
          done();
        });
      });
    });
  });
});
