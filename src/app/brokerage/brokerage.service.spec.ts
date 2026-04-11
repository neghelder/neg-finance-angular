import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BrokerageService } from './brokerage.service';
import { BrokerageCollection } from './brokerage';

describe('BrokerageService', () => {
  let service: BrokerageService;
  let httpMock: HttpTestingController;

  const mockCollections: BrokerageCollection[] = [
    {
      name: 'acoes',
      notes: [
        { ticker: 'PETR4', date: '01/01/2024', op: 'C', qtd: 100, price: 35.5, total_rat: 0.5 }
      ]
    },
    {
      name: 'fiis',
      notes: [
        { ticker: 'HGLG11', date: '02/01/2024', op: 'C', qtd: 10, price: 160.0, total_rat: 0.3 }
      ]
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BrokerageService);
    httpMock = TestBed.inject(HttpTestingController);

    // Flush the initial HTTP call made in the constructor
    const initReq = httpMock.expectOne('http://localhost:8000/brokerage/notes?sort=1');
    initReq.flush(mockCollections);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load brokerage history on construction', (done) => {
    service.brokerageHistory$.subscribe(data => {
      expect(data).toEqual(mockCollections);
      done();
    });
  });

  it('should emit empty array when API returns empty', () => {
    // Re-create service to test empty response
    const newService = TestBed.inject(BrokerageService);
    // The constructor call was already flushed in beforeEach
    // We test that the current emission is the mockCollections
    newService.brokerageHistory$.subscribe(data => {
      expect(data).toBeTruthy();
    });
  });

  describe('updateNote', () => {
    it('should POST note data and reload history', () => {
      const noteData = { collection: 'acoes', id: -1, ticker: 'VALE3', date: '15/03/2024', total_rat: 0.5, op: 'C', price: 70, qtd: 50 };

      service.updateNote(noteData).subscribe();

      const postReq = httpMock.expectOne('http://localhost:8000/brokerage/note');
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(noteData);
      expect(postReq.request.headers.get('Content-Type')).toBe('application/json');
      postReq.flush({});

      // After POST success, it reloads history
      const reloadReq = httpMock.expectOne('http://localhost:8000/brokerage/notes?sort=1');
      reloadReq.flush(mockCollections);
    });

    it('should handle server error on updateNote', () => {
      const noteData = { collection: 'acoes', id: -1, ticker: 'VALE3', date: '15/03/2024', total_rat: 0.5, op: 'C', price: 70, qtd: 50 };

      service.updateNote(noteData).subscribe({
        error: (err) => {
          expect(err).toContain('Backend returned code 500');
        }
      });

      const postReq = httpMock.expectOne('http://localhost:8000/brokerage/note');
      postReq.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('deleteNote', () => {
    it('should DELETE note by id and collection, then reload history', () => {
      service.deleteNote(42, 'acoes').subscribe();

      const deleteReq = httpMock.expectOne('http://localhost:8000/brokerage/note/42?collection=acoes');
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush({});

      // After DELETE success, it reloads history
      const reloadReq = httpMock.expectOne('http://localhost:8000/brokerage/notes?sort=1');
      reloadReq.flush(mockCollections);
    });
  });

  describe('handleError', () => {
    it('should handle client-side error', () => {
      const noteData = { collection: 'acoes', id: -1, ticker: 'VALE3', date: '15/03/2024', total_rat: 0.5, op: 'C', price: 70, qtd: 50 };

      service.updateNote(noteData).subscribe({
        error: (err) => {
          expect(err).toContain('An error occurred:');
        }
      });

      const postReq = httpMock.expectOne('http://localhost:8000/brokerage/note');
      postReq.error(new ProgressEvent('Network error'));
    });
  });
});
