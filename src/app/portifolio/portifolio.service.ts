import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { Portifolio } from './portifolio';

@Injectable({
  providedIn: 'root'
})
export class PortifolioService {

  private http_options = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
  
  private url: string = 'http://localhost:8000/portifolio';

  portifolio$ = this.http.get<Portifolio[]>(this.url).pipe(
    // tap(data => console.log(data)),
    catchError(this.handleError)
  )

  constructor(private http: HttpClient) { }

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
