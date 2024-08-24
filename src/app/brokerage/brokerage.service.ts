import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { BrokerageCollection, Note } from './brokerage';

@Injectable({
  providedIn: 'root'
})
export class BrokerageService {

  private url: string = 'http://localhost:8000/brokerage?sort=1';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
  
  brokerageHistory$ = this.http.get<BrokerageCollection[]>(this.url).pipe(
    catchError(this.handleError)
  )

  constructor(private http: HttpClient) { }

  addNote(data: any) {
    return this.http.post('http://localhost:8000/brokerage/notes', data, this.httpOptions)
      .pipe(
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
