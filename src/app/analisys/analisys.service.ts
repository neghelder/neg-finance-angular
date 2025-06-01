import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Recommendation } from './recommendations/recommendation';
import { Stock } from './models/stock';
import { AnalysisSet } from './models/analysisSet';
import { Reit } from './models/reit';

@Injectable({
  providedIn: 'root'
})
export class AnalisysService {

  private baseUrl: string = 'http://localhost:8000/analisys';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};

  constructor(private http: HttpClient) { }

  getBuyRecommendations(type: string, origin: string, budget: number) {
    return this.http.get<Recommendation[]>(this.baseUrl + `/${type}/buy-rec?origin=${origin}&budget=${budget}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  shareAnalysis$ = this.http.get<AnalysisSet<Stock>[]>(this.baseUrl + `/shares?origin=BR`, this.httpOptions).pipe(
    catchError(this.handleError)
  )

  reitAnalysis$ = this.http.get<AnalysisSet<Reit>[]>(this.baseUrl + `/reits?origin=BR`, this.httpOptions).pipe(
    catchError(this.handleError)
  )

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
