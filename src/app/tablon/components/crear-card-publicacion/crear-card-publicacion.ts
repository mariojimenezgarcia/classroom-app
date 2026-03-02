import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablonServices } from '../../services/tablon.services';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-crear-card-publicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-card-publicacion.html'
})
export class CrearCardPublicacion {
  @Output() publicacionCreada = new EventEmitter<any>();
  @Input() claseId = 0;
  @Input() rol = '';

  tipo = 0; 
  titulo = '';
  contenido = '';
  fechaEntrega: string | null = null;
  puntuacion: number | null = null;
  errorMsg = '';

  //lista de archivos seleccionados
  archivos: File[] = [];

  constructor(
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  // handler para el input file (multiple)
  onArchivosSeleccionados(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      this.archivos = [];
      return;
    }

    this.archivos = Array.from(input.files);
    this.cdr.detectChanges();
  }

  //quitar un archivo seleccionado antes de publicar
  quitarArchivo(index: number) {
    this.archivos.splice(index, 1);
    this.cdr.detectChanges();
  }

  publicar() {
    this.errorMsg = '';

    if (!this.contenido.trim()) {
      this.errorMsg = 'El contenido es obligatorio.';
      this.cdr.detectChanges();
      return;
    }

    // usar FormData para enviar texto + archivos
    const fd = new FormData();
    fd.append('tipo', String(this.tipo));
    fd.append('contenido', this.contenido);

    if (this.tipo !== 0) {
      fd.append('titulo', this.titulo ?? '');
      if (this.fechaEntrega) fd.append('fechaEntrega', this.fechaEntrega);
      if (this.puntuacion !== null && this.puntuacion !== undefined) {
        fd.append('puntuacion', String(this.puntuacion));
      }
    }

    //mismo nombre para todos: "archivos"
    for (const file of this.archivos) {
      fd.append('archivos', file);
    }

    this.tablonSvc.crearPublicacion(this.claseId, fd).subscribe({
      next: (res) => {
        this.publicacionCreada.emit(res);

        this.tipo = 0;
        this.titulo = '';
        this.contenido = '';
        this.fechaEntrega = null;
        this.puntuacion = null;
        this.archivos = [];

        this.errorMsg = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message ?? err?.error?.detail ?? 'Error inesperado';
        this.cdr.detectChanges();
      }
    });
  }
}