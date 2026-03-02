import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablonServices } from '../../services/tablon.services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-entregas-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-entregas-profesor.html'
})
export class VerEntregasProfesor {

  @Input() publicacionId = 0;

  entregas: any[] = [];
  totalAlumnos = 0;
  entregadas = 0;
  pendientes = 0;

  verTodas = false;

  loading = true;
  error = '';

  modalAbierto = false;
  entregaSeleccionada: any = null;

  notaEdit: number | null = null;
  guardando = false;

  private apiBaseUrl = environment.apiUrl;

  constructor(
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  ngOnChanges(): void {
    if (this.publicacionId) this.cargar();
  }

  cargar(): void {
    if (!this.publicacionId) return;

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tablonSvc.getEntregasProfesor(this.publicacionId).subscribe({
      next: (res: any) => {
        this.totalAlumnos = res?.totalAlumnos ?? 0;
        this.entregadas = res?.entregadas ?? 0;
        this.pendientes = res?.pendientes ?? 0;
        this.entregas = res?.items ?? [];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando entregas';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirEntrega(e: any): void {
    this.entregaSeleccionada = e;
    this.notaEdit = e?.nota ?? null;
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.entregaSeleccionada = null;
    this.notaEdit = null;
    this.guardando = false;
    this.cdr.detectChanges();
  }

  guardarNota(): void {
    const idEntrega = this.entregaSeleccionada?.id;
    if (!idEntrega) return;

    this.guardando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tablonSvc.ponerNotaEntrega(idEntrega, this.notaEdit).subscribe({
      next: () => {
        // actualizar en el modal
        if (this.entregaSeleccionada) this.entregaSeleccionada.nota = this.notaEdit;

        // actualizar en la lista
        const idx = this.entregas.findIndex(x => x.id === idEntrega);
        if (idx >= 0) this.entregas[idx].nota = this.notaEdit;

        this.guardando = false;
        this.cdr.detectChanges();
        this.cerrarModal();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.message ?? 'Error guardando nota';
        this.cdr.detectChanges();
      }
    });
  }


  // Helpers
  
  archivoUrl(path: string | null | undefined): string {
    const u = (path ?? '').toString().trim();
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${this.apiBaseUrl}${u}`; 
  }

  nombreArchivo(path: string | null | undefined): string {
    const p = (path ?? '').toString().trim();
    if (!p) return '';
    const clean = p.split('?')[0];
    const parts = clean.split('/');
    return parts[parts.length - 1] || clean;
  }

  extension(nombre: string | null | undefined): string {
    const n = (nombre ?? '').toString().trim();
    if (!n) return '';
    const parts = n.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : '';
  }

  formatearTamano(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} B`;
  }

  esImagenEntrega(mime?: string | null, path?: string | null): boolean {
    const mt = (mime ?? '').toString().toLowerCase();
    if (mt.startsWith('image/')) return true;

    const p = (path ?? '').toString().toLowerCase();
    return (
      p.endsWith('.png') ||
      p.endsWith('.jpg') ||
      p.endsWith('.jpeg') ||
      p.endsWith('.gif') ||
      p.endsWith('.webp')
    );
  }

  iconoPorMime(mime?: string | null, path?: string | null): string {
    const mt = (mime ?? '').toString().toLowerCase();
    const p = (path ?? '').toString().toLowerCase();

    if (mt.startsWith('image/') || this.esImagenEntrega(mt, p)) return '🖼';
    if (mt.includes('pdf') || p.endsWith('.pdf')) return '📄';
    if (mt.includes('zip') || mt.includes('compressed') || p.endsWith('.zip') || p.endsWith('.rar') || p.endsWith('.7z')) return '🗜';
    if (mt.includes('word') || p.endsWith('.doc') || p.endsWith('.docx')) return '📝';
    if (mt.includes('excel') || p.endsWith('.xls') || p.endsWith('.xlsx')) return '📊';

    return '📎';
  }
}