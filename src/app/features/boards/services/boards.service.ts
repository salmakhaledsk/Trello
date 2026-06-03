import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BoardsService {
  http = inject(HttpClient);

  getBoards() {
   return this.http.get<any>('assets/data/data.json');
  }
}
