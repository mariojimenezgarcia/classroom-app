import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../services/home.services';

@Component({
  selector: 'app-codigo-clase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './codigo-clase.html',
})
export class CodigoClase implements OnInit {

  codigo = '';
  nombreClase = '';
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homeSvc: HomeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Clase inválida';
      this.loading = false;
      return;
    }

    this.homeSvc.codigoClase(id).subscribe({
      next: (res) => {
        this.codigo = res.codigoAcceso;
        this.nombreClase = res.nombre;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando el código';
        this.loading = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/home']);
  }

  copiar() {
    if (!this.codigo) return;

    navigator.clipboard.writeText(this.codigo);
  }
}
