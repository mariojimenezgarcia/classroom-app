import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [RouterLink , FormsModule, CommonModule],
  templateUrl: './register.html',
})
export class Register {
  nombre="";
  email= '';
  password='';
  rol='';
  errorMsg = '';
  constructor(
    private authSvc: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  register() {
    this.errorMsg = '';

    // Validación básica de UX
    if (!this.nombre.trim() ||!this.email.trim() || !this.password.trim()|| !this.rol.trim()) {
      this.errorMsg = 'Rellena los campos';
      this.cdr.detectChanges();
      return;
    }

    //llamada api
    this.authSvc.register({ nombre:this.nombre ,email: this.email, password: this.password , rol: this.rol}).subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/login', {
          state: { successMsg: 'Usuario creado correctamente.' }
        });
      },

      error: (err) => {
          this.errorMsg = err?.error?.message ?? 'Error inesperado';
          this.cdr.detectChanges();
     }
    })
  }
}
