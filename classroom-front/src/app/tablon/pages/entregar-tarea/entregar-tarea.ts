import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TablonServices } from '../../services/tablon.services';
import { VerEntregasProfesor } from '../../components/ver-entregas-profesor/ver-entregas-profesor';
import { AlumnoEntregas } from '../../components/alumno-entregas/alumno-entregas';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-entregar-tarea',
  standalone: true,
  imports: [CommonModule, FormsModule, VerEntregasProfesor, AlumnoEntregas],
  templateUrl: './entregar-tarea.html'
})
export class EntregarTarea {

  id = 0; 

  miUsuarioId = 0;
  rol = '';

  tarea: any = null;

  loading = true;
  error = '';

  apiBaseUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.miUsuarioId = Number(localStorage.getItem('userId') || 0);
    this.rol = (localStorage.getItem('rol') || '').trim().toLowerCase();

    const id = Number(this.route.snapshot.paramMap.get('publicacionId'));
    if (!id) {
      this.error = 'Tarea inválida';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.id = id;
    this.cargarTarea();
  }

  cargarTarea(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    //esto devuelve 1 publicación con adjuntos
    this.tablonSvc.getPublicacionById(this.id).subscribe({
      next: (res) => {
        this.tarea = res;

        if (!this.tarea?.adjuntos && this.tarea?.archivos) this.tarea.adjuntos = this.tarea.archivos;
        if (!this.tarea?.adjuntos) this.tarea.adjuntos = [];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando la tarea';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  esImagen(a: any): boolean {
    const mt = (a?.mimeType ?? '').toString().toLowerCase();
    return mt.startsWith('image/');
  }

  adjuntoUrl(a: any): string {
    const u = (a?.url ?? '').toString().trim();
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${this.apiBaseUrl}${u}`; 
  }
  private normalizarAdjunto(a: any): any {
  const url = (a?.url ?? a?.archivo ?? a?.ruta ?? '').toString().trim();

  const nombre = (
    a?.nombre ??
    a?.nombreGuardado ??
    (url ? url.split('?')[0].split('/').pop() : '')
  )?.toString();

  const nombreOriginal = (
    a?.nombreOriginal ??
    a?.archivoNombreOriginal ??
    a?.originalName ??
    null
  )?.toString();

  return {
    ...a,
    url,
    nombre,
    nombreOriginal,
    mimeType: a?.mimeType ?? a?.tipoMime ?? a?.contentType ?? ''
  };
}

private normalizarAdjuntos(): void {
  if (!this.tarea) return;

  if (!this.tarea?.adjuntos && this.tarea?.archivos) this.tarea.adjuntos = this.tarea.archivos;
  if (!this.tarea?.adjuntos) this.tarea.adjuntos = [];

  this.tarea.adjuntos = (this.tarea.adjuntos ?? []).map((x: any) => this.normalizarAdjunto(x));
}
}