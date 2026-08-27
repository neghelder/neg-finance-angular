import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Recommendation } from './recommendations/recommendation';
import { Stock } from './models/stock';
import { AnalysisSet } from './models/analysisSet';
import { Reit } from './models/reit';
import { Fiagro } from './models/fiagro';
import { FiagroReportsResponse } from './models/fiagro-report';
import { CriteriaConfig } from './models/criteria';
import { Etf } from './models/etf';
import { Bdr } from './models/bdr';


@Injectable({
  providedIn: 'root'
})
export class AnalisysService {

  private baseUrl: string = 'http://localhost:8000/analisys';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private http: HttpClient) { }

  getBuyRecommendations(type: string, origin: string, budget: number) {
    return this.http.get<Recommendation[]>(this.baseUrl + `/${type}s/buy-rec?origin=${origin}&budget=${budget}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  getShareAnalysis(origin: string = 'BR'): Observable<AnalysisSet<Stock>[]> {
    return this.http.get<AnalysisSet<Stock>[]>(this.baseUrl + `/shares?origin=${origin}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getReitAnalysis(origin: string = 'BR'): Observable<AnalysisSet<Reit>[]> {
    return this.http.get<AnalysisSet<Reit>[]>(this.baseUrl + `/reits?origin=${origin}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getEtfAnalysis(origin: string = 'USA'): Observable<AnalysisSet<Etf>[]> {
    return this.http.get<AnalysisSet<Etf>[]>(this.baseUrl + `/etfs?origin=${origin}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getBdrAnalysis(origin: string = 'BR'): Observable<AnalysisSet<Bdr>[]> {
    return this.http.get<AnalysisSet<Bdr>[]>(this.baseUrl + `/bdrs?origin=${origin}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getFiagroAnalysis(origin: string = 'BR'): Observable<AnalysisSet<Fiagro>[]> {
    return this.http.get<AnalysisSet<Fiagro>[]>(this.baseUrl + `/fiagros?origin=${origin}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getFiagrosBuyRec(origin: string = 'BR', budget: number): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(
      this.baseUrl + `/fiagros/buy-rec?origin=${origin}&budget=${budget}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  getFiagroReports(forceRefresh: boolean = false): Observable<FiagroReportsResponse> {
    return this.http.get<FiagroReportsResponse>(
      this.baseUrl + `/fiagros/reports?force_refresh=${forceRefresh}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  shareAnalysis$ = this.getShareAnalysis('BR');
  reitAnalysis$ = this.getReitAnalysis('BR');
  etfAnalysis$ = this.getEtfAnalysis('USA');
  bdrAnalysis$ = this.getBdrAnalysis('BR');

  getCriteria(): Observable<CriteriaConfig> {
    return this.http.get<CriteriaConfig>(this.baseUrl + '/criteria', this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  saveCriteria(config: CriteriaConfig): Observable<CriteriaConfig> {
    return this.http.put<CriteriaConfig>(this.baseUrl + '/criteria', config, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getWatchlist(collection: string): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:8000/watchlist?collection=${collection}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  addToWatchlist(ticker: string, collection: string): Observable<any> {
    return this.http.post<any>(`http://localhost:8000/watchlist`, { ticker, collection }, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  removeFromWatchlist(ticker: string, collection: string): Observable<any> {
    return this.http.delete<any>(`http://localhost:8000/watchlist/${ticker}?collection=${collection}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }
}
