import { ChangeDetectorRef, Component } from '@angular/core';
import { HomeService } from '../../services/home.services';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-clase',
  imports: [RouterLink , FormsModule, CommonModule],
  templateUrl: './crear-clase.html',
})
export class CrearClase {
  nombre="";
  curso= '';
  aula='';
  color='';
  errorMsg = '';
  creando = false;
  successMsg: any;
  constructor(
    private homeSvc: HomeService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}


  crearClase() {
    this.errorMsg = '';
    this.creando = true;

    // Validación  UX
    if (!this.nombre.trim() ||!this.curso.trim() || !this.aula.trim()|| !this.color.trim()) {
      this.errorMsg = 'Rellena los campos';
      this.cdr.detectChanges();
      return;
    }

    //llamada api
    this.homeSvc.crearClase({ nombre:this.nombre ,curso: this.curso, aula: this.aula , color: this.color}).subscribe({
      next: () => {
        // Esperar 3 segundos antes de navegar
        setTimeout(() => {
          this.creando = false;

          this.router.navigateByUrl('/home', {
            state: { successMsg: 'Clase creada correctamente.' }
          });

        }, 3000);

      },

      error: (err) => {
          this.errorMsg = err?.error?.message ?? 'Error inesperado';
          this.cdr.detectChanges();
     }
    })
  }
}
