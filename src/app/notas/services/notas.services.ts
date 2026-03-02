import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaItem, PadreHijoItem } from '../pages/notas-page/notas-page';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}


  getMisHijos(): Observable<PadreHijoItem[]> {
    return this.http.get<PadreHijoItem[]>(`${this.baseUrl}/notas/mis-hijos`);
  }
  getNotas(alumnoId?: number): Observable<NotaItem[]> {
    const url = alumnoId
      ? `${this.baseUrl}/notas?alumnoId=${alumnoId}`
      : `${this.baseUrl}/notas`;

    return this.http.get<NotaItem[]>(url);
  }
}