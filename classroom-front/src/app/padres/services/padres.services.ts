import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PadreHijoItem {
  alumnoId: number;
  nombre: string;
}

export interface NotaItem {
  claseId: number;
  nombreClase: string;

  publicacionId: number;
  titulo: string;

  tipo: 'Tarea' | 'Examen';

  fechaEntrega: string | null;    
  fechaEntregada: string | null; 

  nota: number | null;

  puntuacionMaxima: number | null;
}

@Injectable({ providedIn: 'root' })
export class PadresService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  vincularHijo(codigoAlumno: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/notas/vincular`, { codigoAlumno });
  }
  getNotas(alumnoId: number): Observable<NotaItem[]> {
    return this.http.get<NotaItem[]>(`${this.baseUrl}/notas?alumnoId=${alumnoId}`);
  }
}