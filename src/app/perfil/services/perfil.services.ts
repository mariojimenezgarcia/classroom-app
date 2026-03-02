import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PerfilServices {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

    getUsuarioById(id: number) {
      return this.http.get<{ id: number; nombre: string; email: string; fotoUrl?: string | null }>(
        this.baseUrl + `/Perfil/${id}`
      );
    }

    editarUsuario(id: number, body: FormData) {
      return this.http.put<any>(
        this.baseUrl + `/Perfil/${id}`,
        body
      );
    }
}
