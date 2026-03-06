import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../components/spinner-component/spinner-component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule, SpinnerComponent],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  errorMsg = '';
  successMsg = '';
  loading = false;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.successMsg = history.state?.successMsg ?? '';

    if (this.successMsg) {
      history.replaceState({}, '', this.router.url);
    }
  }

  login() {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Rellena los 2 campos';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

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

        if (rol === 'padres') {
          this.router.navigateByUrl('/notas');
        } else {
          this.router.navigateByUrl('/home');
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Error inesperado';
        this.cdr.detectChanges();
      }
    });
  }
}