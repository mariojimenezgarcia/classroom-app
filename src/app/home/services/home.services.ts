import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";

export interface Clase {
  id: number;
  nombre: string;
  aula: string;
  color: string;
  curso:string;
  profesorNombre:string;
}
export interface AdminUsuarioClases {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string;
  clases: string[];
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

      getMisClases() {
        return this.http.get<any[]>(
          this.baseUrl + '/clases/mias'
        );
      }
      getUsuariosConClases() {
        return this.http.get<AdminUsuarioClases[]>(
          this.baseUrl + '/Admin/usuarios-clases'
        );
      }
      crearClase(body: {nombre: string; curso: string; aula: string; color: string  }) {
        return this.http.post<{
          codigoAcceso(arg0: string, codigoAcceso: any): unknown; message:string }>(
          this.baseUrl + '/clases',
          body
        );
      }
      unirseClase(body: {codigoAcceso: string }) {
        return this.http.post<{ message:string }>(
          this.baseUrl + '/clases/unirse',
          body
        );
      }
      codigoClase(id: number) {
        return this.http.get<{ claseId: number; nombre: string; codigoAcceso: string }>(
          this.baseUrl + `/Clases/${id}/codigo`
        );
      }
      alumnosClase(id: number) {
        return this.http.get<{
          claseId: number;
          nombreClase: string;
          curso: string;
          aula: string;
          personas: { usuarioId: number; nombre: string; email: string; rol: string }[];
        }>(
          this.baseUrl + `/Clases/${id}/personas`
        );
      }
      getClaseById(id: number) {
        return this.http.get<{ id: number; nombre: string; curso: string; aula: string; color: string }>(
          this.baseUrl + `/Clases/${id}`
        );
      }
      editarClase(id: number, body: { nombre: string; curso: string; aula: string; color: string }) {
        return this.http.put<{ message: string; claseId: number }>(
          this.baseUrl + `/Clases/${id}`,
          body
        );
      }
      salirDeClase(id: number) {
        return this.http.delete<{ message: string; claseId: number }>(
          this.baseUrl + `/Clases/${id}`
        );
      }
      borrarUsuario(id: number) {
        return this.http.delete(this.baseUrl + `/Admin/usuarios/${id}`);
      }
}