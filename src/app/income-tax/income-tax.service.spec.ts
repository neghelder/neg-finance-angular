import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { IncomeTaxService } from './income-tax.service';
import { assetFixture } from './income-tax.fixture';

describe('IncomeTaxService', () => {
  let service: IncomeTaxService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(IncomeTaxService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it.each([2025, 2026])('requests the annual read-only projection for %s', year => {
    const rows = [assetFixture({ calendar_year: year })];
    service.getAssets(year).subscribe(actual => expect(actual).toEqual(rows));
    const request = http.expectOne(`http://localhost:8000/income-tax/assets?calendar_year=${year}`);
    expect(request.request.method).toBe('GET');
    request.flush(rows);
  });

  it('preserves HTTP failure rather than presenting an empty portfolio', () => {
    const error = jest.fn();
    service.getAssets(2025).subscribe({ error });
    http.expectOne('http://localhost:8000/income-tax/assets?calendar_year=2025').flush({ detail: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 503 }));
  });
});
