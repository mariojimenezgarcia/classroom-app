import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TablonServices } from '../../services/tablon.services';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-alumno-entregas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alumno-entregas.html'
})
export class AlumnoEntregas implements OnInit, OnChanges {

  @Input() publicacionId = 0;

  miEntrega: any = {
    asunto: '',
    archivo: '',
    entregada: false,
    fechaEntrega: null,
    nota: null
  };

  loading = true;
  error = '';

  // archivo elegido en el input
  archivoSeleccionado: File | null = null;
  archivoSeleccionadoNombre = '';

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

  // ========= Helpers =========
  private absUrl(path: string | null | undefined): string {
    const u = (path ?? '').toString().trim();
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${this.apiBaseUrl}${u}`;
  }

  private normalizarEntrega(res: any): any {
    // si no existe entrega todavía
    if (!res) {
      return {
        asunto: '',
        archivo: '',
        entregada: false,
        fechaEntrega: null,
        nota: null,
        archivoUrl: '',
        archivoNombre: '',
      };
    }

    const archivoPath = res.archivo ?? '';
    const archivoNombre =
      res.archivoNombreOriginal ||
      res.archivoNombre ||
      (archivoPath ? archivoPath.split('?')[0].split('/').pop() : '');

    return {
      ...res,
      archivo: archivoPath,
      archivoNombre,
      archivoUrl: archivoPath ? this.absUrl(archivoPath) : ''
    };
  }

  onFileSelected(event: any): void {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) {
      this.archivoSeleccionado = null;
      this.archivoSeleccionadoNombre = '';
      return;
    }

    this.archivoSeleccionado = file;
    this.archivoSeleccionadoNombre = file.name;
  }
  formatearTamano(bytes: number | null | undefined): string {
    if (!bytes || bytes <= 0) return '';

    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    if (kb >= 1) return `${kb.toFixed(1)} KB`;
    return `${bytes} B`;
  }

  // llamada API
  cargar(): void {
    if (!this.publicacionId) return;

    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.tablonSvc.getMiEntrega(this.publicacionId).subscribe({
      next: (res: any) => {
        this.miEntrega = this.normalizarEntrega(res);

        this.archivoSeleccionado = null;
        this.archivoSeleccionadoNombre = '';

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando tu entrega';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarBorrador(): void {
    if (!this.publicacionId) return;

    this.error = '';
    this.cdr.detectChanges();

    const fd = new FormData();
    fd.append('asunto', this.miEntrega?.asunto ?? '');

    //si hay archivo nuevo seleccionado, lo subimos
    if (this.archivoSeleccionado) {
      fd.append('archivo', this.archivoSeleccionado);
    }

    this.tablonSvc.guardarBorrador(this.publicacionId, fd).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        this.error = err?.error?.message ?? 'Error guardando borrador';
        this.cdr.detectChanges();
      }
    });
  }

  entregar(): void {
    if (!this.publicacionId) return;

    this.error = '';
    this.cdr.detectChanges();

    const fd = new FormData();
    fd.append('asunto', this.miEntrega?.asunto ?? '');

    if (this.archivoSeleccionado) {
      fd.append('archivo', this.archivoSeleccionado); // nombre del campo = "archivo" 
    }

    this.tablonSvc.entregarTarea(this.publicacionId, fd).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        this.error = err?.error?.message ?? 'Error entregando tarea';
        this.cdr.detectChanges();
      }
    });
  }

  anularEntrega(): void {
    if (!this.publicacionId) return;

    this.error = '';
    this.cdr.detectChanges();

    this.tablonSvc.anularEntrega(this.publicacionId).subscribe({
      next: () => this.cargar(),
      error: (err) => {
        this.error = err?.error?.message ?? 'Error anulando entrega';
        this.cdr.detectChanges();
      }
    });
  }
}