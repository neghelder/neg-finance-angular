import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { BrokerageCollection, Note } from './brokerage';

@Injectable({
  providedIn: 'root'
})
export class BrokerageService {

  private url: string = 'http://localhost:8000/brokerage/notes?sort=1';
  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json'})};
  
  private brokerageHistorySubject = new BehaviorSubject<BrokerageCollection[]>([]);
  brokerageHistory$ = this.brokerageHistorySubject.asObservable();

  // brokerageHistory$ = this.http.get<BrokerageCollection[]>(this.url).pipe(
  //   catchError(this.handleError)
  // )

  constructor(private http: HttpClient) { 
    this.loadBrokerageHistory();
  }

  updateNote(data: any) {
    return this.http.post('http://localhost:8000/brokerage/note', data, this.httpOptions)
      .pipe(
        tap(() => this.loadBrokerageHistory()),
        catchError(this.handleError)
      );
  }

  deleteNote(id: Number, collection_name: string) {
    return this.http.delete(`http://localhost:8000/brokerage/note/${id}?collection=${collection_name}`)
      .pipe(
        tap(() => this.loadBrokerageHistory()),
        catchError(this.handleError)
      );
  }

  private loadBrokerageHistory() : void {
    this.http.get<BrokerageCollection[]>(this.url)
    .pipe(
      tap(collections => console.log(collections)),
      catchError(this.handleError)
    )
    .subscribe((data: BrokerageCollection[]) => this.brokerageHistorySubject.next(data));
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
