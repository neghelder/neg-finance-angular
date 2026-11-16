import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IncomeTaxAsset } from './income-tax';

@Injectable({ providedIn: 'root' })
export class IncomeTaxService {
  constructor(private readonly http: HttpClient) {}

  getAssets(calendarYear: number): Observable<IncomeTaxAsset[]> {
    return this.http.get<IncomeTaxAsset[]>('http://localhost:8000/income-tax/assets', {
      params: { calendar_year: calendarYear }
    });
  }
}
