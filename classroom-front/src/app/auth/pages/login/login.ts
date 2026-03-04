import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { FormsModule} from "@angular/forms";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink , FormsModule, CommonModule],
  templateUrl: './login.html',
})
export class Login {
  email= '';
  password='';
  errorMsg = '';
  successMsg = '';

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
  this.successMsg = history.state?.successMsg ?? '';
  //borrar el mensaje al echar para atras
  if (this.successMsg) {
    history.replaceState({}, '', this.router.url);
  }
}


  login() {
    this.errorMsg = '';
    this.successMsg = '';

    //Validación básica de UX
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Rellena los 2 campos';
      this.cdr.detectChanges();
      return;
    }

    //llamada api
    this.authSvc.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('nombre', res.nombre);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('userId', String(res.userId));
        if (res.fotoUrl && String(res.fotoUrl).trim() && res.fotoUrl !== 'null') {
          localStorage.setItem('fotoUrl', res.fotoUrl);
        } else {
          localStorage.removeItem('fotoUrl');
        }

        const rol = (res.rol || '').toLowerCase().trim();

        //Redirección por rol
        if (rol === 'padres') {
          this.router.navigateByUrl('/notas');    
        } else {
          this.router.navigateByUrl('/home');     
        }
      },
    error: (err) => {
        this.errorMsg = err?.error?.message ?? 'Error inesperado';
        this.cdr.detectChanges();
      }
    })
  }
}


