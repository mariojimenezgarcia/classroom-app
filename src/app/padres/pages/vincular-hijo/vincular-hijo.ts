import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PadresService } from '../../services/padres.services';


@Component({
  selector: 'app-vincular-hijo-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vincular-hijo.html',
})
export class VincularHijo {
  rol = (localStorage.getItem('rol') || '').toLowerCase();

  codigoAlumno = '';
  loading = false;
  errorMsg = '';
  okMsg = '';

  constructor(
    private padresSvc: PadresService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Si no es padre, fuera
    if (this.rol !== 'padres') {
      this.router.navigateByUrl('/notas');
      return;
    }
  }

  vincular() {
    this.errorMsg = '';
    this.okMsg = '';
    const codigo = this.codigoAlumno.trim().toUpperCase();

    if (!codigo) return;

    this.loading = true;

    this.padresSvc.vincularHijo(codigo).subscribe({
      next: () => {
        this.okMsg = 'Alumno vinculado correctamente.';
        this.loading = false;
        this.cdr.detectChanges();

        // ir a notas 
        setTimeout(() => this.router.navigateByUrl('/notas'), 300);
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Código no válido o no se pudo vincular.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}