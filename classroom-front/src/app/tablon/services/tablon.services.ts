import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TablonServices {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}
      getClaseById(id: number) {
        return this.http.get<{ id: number; nombre: string; curso: string; aula: string; color: string }>(
          this.baseUrl + `/Clases/${id}`
        );
      }
      getPublicacionesByClaseId(idClase: number) {
        return this.http.get<any[]>(
          this.baseUrl + `/Publicaciones/${idClase}/publicaciones`
        );
      }
      crearPublicacion(idClase: number, body: any) {
        return this.http.post<any>(
          this.baseUrl + `/Publicaciones/${idClase}/publicaciones`,
          body
        );
      }
      borrarPublicacion(idPublicacion: number) {
        return this.http.delete<any>(this.baseUrl + `/Publicaciones/${idPublicacion}`);
      }
      getPublicacionById(id: number) {
        return this.http.get<any>(this.baseUrl + `/Publicaciones/${id}`);
      }
      getMiEntrega(idPublicacion: number) {
        return this.http.get<any>(
          this.baseUrl + `/Publicaciones/${idPublicacion}/mi-entrega`
        );
      }
      guardarBorrador(idPublicacion: number, body: FormData) {
        return this.http.post<any>(
          this.baseUrl + `/Publicaciones/${idPublicacion}/guardar-borrador`,
          body
        );
      }

      entregarTarea(idPublicacion: number, body: FormData) {
        return this.http.post<any>(this.baseUrl + `/Publicaciones/${idPublicacion}/entregar`, body);
      }
      anularEntrega(idPublicacion: number) {
        return this.http.post<any>(
          this.baseUrl + `/Publicaciones/${idPublicacion}/anular-entrega`,
          {}
        );
      }
      getEntregasProfesor(idPublicacion: number) {
        return this.http.get<any>(this.baseUrl + `/Publicaciones/${idPublicacion}/entregas`);
      }
      ponerNotaEntrega(idEntrega: number, nota: number | null) {
        return this.http.put<any>(this.baseUrl + `/Entregas/${idEntrega}/nota`, { nota });
      }
}
