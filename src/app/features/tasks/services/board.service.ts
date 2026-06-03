import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

   private http = inject(HttpClient);

  getBoards(): Observable<any> {
    return this.http.get('assets/data/data.json');
  }
}
