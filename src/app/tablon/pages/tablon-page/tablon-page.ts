import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TablonServices } from '../../services/tablon.services';
import { CardPublicacion } from '../../components/card-publicacion/card-publicacion';
import { CrearCardPublicacion } from '../../components/crear-card-publicacion/crear-card-publicacion';

@Component({
  selector: 'app-tablon-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardPublicacion, CrearCardPublicacion],
  templateUrl: './tablon-page.html',
})
export class TablonPage {

  claseId = 0;
  miUsuarioId = Number(localStorage.getItem('userId') || 0);
  rol = (localStorage.getItem('rol') || '').trim().toLowerCase();

  publicaciones: any[] = [];
  loadingPublicaciones = true;
  errorPublicaciones = '';

  constructor(
    private route: ActivatedRoute,
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('claseId'));
    if (!id) return;

    this.claseId = id;
    this.cargarPublicaciones();
  }

  agregarPublicacion(nueva: any) {
    this.publicaciones.unshift(nueva);
    this.cdr.detectChanges();
  }

  cargarPublicaciones(): void {
    this.loadingPublicaciones = true;
    this.errorPublicaciones = '';

    this.tablonSvc.getPublicacionesByClaseId(this.claseId).subscribe({
      next: (res) => {
        this.publicaciones = res ?? [];
        this.loadingPublicaciones = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorPublicaciones = err?.error?.message ?? 'Error cargando el tablón';
        this.loadingPublicaciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  quitarPublicacion(id: number) {
    this.publicaciones = this.publicaciones.filter(p => p.id !== id);
    this.cdr.detectChanges();
  }
}