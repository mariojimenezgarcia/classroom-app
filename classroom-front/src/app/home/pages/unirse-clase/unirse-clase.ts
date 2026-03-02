import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HomeService } from '../../services/home.services';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unirse-clase',
  imports: [RouterLink , FormsModule, CommonModule],
  templateUrl: './unirse-clase.html',
})
export class UnirseClase {
  codigo='';
  errorMsg = '';
  successMsg: any;
  constructor(
    private homeSvc: HomeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  unirseClase() {
    this.errorMsg = '';

    // Validación básica de UX
    if (!this.codigo.trim()) {
      this.errorMsg = 'Rellena los campos';
      this.cdr.detectChanges();
      return;
    }

    //llamada api
    this.homeSvc.unirseClase({ codigoAcceso:this.codigo }).subscribe({
      next: () => {
        this.router.navigateByUrl('/home', {
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
