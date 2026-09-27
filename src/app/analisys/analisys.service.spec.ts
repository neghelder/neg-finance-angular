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

  describe('scheduled report API', () => {
    const snapshot = {
      id: 'snapshot-1', run_id: 'run-1', asset_type: 'FII', ticker: 'HGLG11',
      qualitative_analysis_id: null, market_status: 'CHEAP', portfolio_status: 'NOT_HELD',
      grade: 8, rank: 1, criterion_results_json: '{}', cohort_size: 10, criteria_hash: 'criteria',
      market_snapshot_at: '2026-09-02T08:00:00', cvm_json: null, final_label: 'INDETERMINADO',
      created_at: '2026-09-02T08:00:00'
    } as const;

    it('fetches report snapshots by asset class without triggering analysis', () => {
      service.getScheduledReports('FII').subscribe(reports => expect(reports).toEqual([snapshot]));

      const req = httpMock.expectOne('http://localhost:8000/analisys/reports?asset_type=FII');
      expect(req.request.method).toBe('GET');
      req.flush([snapshot]);
    });

    it('fetches an asset history using the generic read endpoint', () => {
      service.getScheduledReportHistory('STOCK', 'WEGE3').subscribe(history => expect(history).toEqual([snapshot]));

      const req = httpMock.expectOne('http://localhost:8000/analisys/reports/STOCK/WEGE3/history');
      expect(req.request.method).toBe('GET');
      req.flush([snapshot]);
    });

    it('fetches scheduler status', () => {
      const status = { runs: [], jobs: { QUEUED: 2 }, config: {}, runtime: { codex_available: true, auth_available: true } };
      service.getReportAutomationStatus().subscribe(value => expect(value).toEqual(status));

      const req = httpMock.expectOne('http://localhost:8000/analisys/reports/automation/status');
      expect(req.request.method).toBe('GET');
      req.flush(status);
    });

    it('loads the supported ticker catalogue and its configured batch limit', () => {
      const assets = { asset_type: 'FIAGRO', tickers: ['KNCA11', 'RZAG11'], max_jobs_per_run: 5 } as const;
      service.getReportAutomationAssets('FIAGRO').subscribe(value => expect(value).toEqual(assets));

      const req = httpMock.expectOne('http://localhost:8000/analisys/reports/automation/assets?asset_type=FIAGRO');
      expect(req.request.method).toBe('GET');
      req.flush(assets);
    });

    it('creates a manual automation run without changing the requested payload', () => {
      const payload = { asset_type: 'STOCK' as const, tickers: ['WEGE3'], force_reprocess: false };
      const response = { run_id: 'run-42', status: 'QUEUED', tickers: ['WEGE3'] };
      service.createReportAutomationRun(payload).subscribe(value => expect(value).toEqual(response));

      const req = httpMock.expectOne('http://localhost:8000/analisys/reports/automation/runs');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(response);
    });

    it('gets run progress and retries recoverable jobs using their dedicated routes', () => {
      const run = {
        run_id: 'run-42', status: 'PARTIAL',
        requested: { asset_type: 'FII', tickers: ['HGLG11'], force_reprocess: false },
        jobs: { FAILED: 1 }, diagnostics: [], errors: [{ ticker: 'HGLG11', code: 'PROCESSING_FAILED', attempts: 1, status: 'FAILED' }]
      };
      service.getReportAutomationRun('run 42').subscribe(value => expect(value).toEqual(run));

      const getReq = httpMock.expectOne('http://localhost:8000/analisys/reports/automation/runs/run%2042');
      expect(getReq.request.method).toBe('GET');
      getReq.flush(run);

      service.retryReportAutomationRun('run 42').subscribe(value => expect(value).toEqual(run));
      const retryReq = httpMock.expectOne('http://localhost:8000/analisys/reports/automation/runs/run%2042/retry');
      expect(retryReq.request.method).toBe('POST');
      expect(retryReq.request.body).toEqual({});
      retryReq.flush(run);
    });
  });
});
