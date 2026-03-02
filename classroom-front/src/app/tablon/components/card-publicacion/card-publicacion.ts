import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TablonServices } from '../../services/tablon.services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-card-publicacion',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './card-publicacion.html'
})
export class CardPublicacion implements OnChanges {

  avatarSrc = 'images/usuario.png';

  menuAbierto = false;

  @Input() publicacion: any;
  @Input() miUsuarioId = 0;
  @Input() rol = '';

  @Output() publicacionBorrada = new EventEmitter<number>();

  apiBaseUrl = environment.apiUrl;

  constructor(
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    this.actualizarAvatar();
  }

  private actualizarAvatar(): void {
    const userId = Number(localStorage.getItem('userId') || 0);

    // Si aún no hay publicación (render inicial), por defecto
    if (!this.publicacion) {
      this.avatarSrc = 'images/usuario.png';
      return;
    }

    // Solo si es mi publicación, intento mi foto del localStorage
    if (this.publicacion?.autorId === userId) {
      const stored = (localStorage.getItem('fotoUrl') || '').trim();

      if (!stored) {
        this.avatarSrc = 'images/usuario.png';
        return;
      }

      // absoluta
      if (stored.startsWith('http://') || stored.startsWith('https://')) {
        this.avatarSrc = stored;
        return;
      }

      // relativa
      if (stored.startsWith('/')) {
        this.avatarSrc = `${this.apiBaseUrl}${stored}`;
        return;
      }

      // cualquier otra cosa rara -> fallback
      this.avatarSrc = 'images/usuario.png';
      return;
    }

    // No es mía -> default (sin llamadas a API)
    this.avatarSrc = 'images/usuario.png';
  }

  onAvatarError(): void {
    // si falla la url por lo que sea, nunca se rompe:
    this.avatarSrc = 'images/usuario.png';
  }

  get puedoBorrar(): boolean {
    return this.publicacion?.autorId === this.miUsuarioId;
  }

  borrar(): void {
    this.menuAbierto = false;
    const id = this.publicacion?.id;
    if (!id) return;

    this.tablonSvc.borrarPublicacion(id).subscribe({
      next: () => {
        this.publicacionBorrada.emit(id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  get tipoLabel(): string {
    switch (this.publicacion?.tipo) {
      case 0: return 'Anuncio';
      case 1: return 'Tarea';
      case 2: return 'Examen';
      default: return '';
    }
  }

  get tipoClasses(): string {
    switch (this.publicacion?.tipo) {
      case 0: return 'bg-indigo-100 text-indigo-700';
      case 1: return 'bg-amber-100 text-amber-700';
      case 2: return 'bg-red-100 text-red-700';
      default: return '';
    }
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

  stop(e: Event): void {
    e.stopPropagation();
  }

  formatearTamano(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '';

    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} B`;
  }
}