import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Injectable } from "@angular/core";


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/api/Auth`;

  constructor(private http: HttpClient) {}

      login(body: { email: string; password: string }) {
        return this.http.post<{ token: string;userId: number; nombre: string; email: string; rol: string; fotoUrl:string }>(
          this.baseUrl + '/login',
          body
        );
      }
       register(body: {nombre: string; email: string; password: string; rol: string  }) {
        return this.http.post<{ message:string }>(
          this.baseUrl + '/register',
          body
        );
      }
}