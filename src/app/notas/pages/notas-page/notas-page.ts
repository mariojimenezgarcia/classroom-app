import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotasService } from '../../services/notas.services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notas-page',
  imports: [CommonModule],
  templateUrl: './notas-page.html',
})
export class NotasPage {
  rol = (localStorage.getItem('rol') || '').toLowerCase();

  // Notas 
  notasPorClase: NotasGrupoClase[] = [];
  loadingNotas = false;
  notasError = '';

  // Padre
  misHijos: PadreHijoItem[] = [];
  loadingHijos = false;
  hijosError = '';
  selectedAlumnoId: number | null = null;

  constructor(private notasSvc: NotasService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit(): void {
    if (this.rol === 'alumno') {
      this.cargarNotas(); 
      return;
    }

    if (this.rol === 'padres') {
      this.cargarMisHijos(); 
      return;
    }
  }

  // ===== NOTAS (ALUMNO o PADRE) =====
  private cargarNotas(alumnoId?: number) {
    this.loadingNotas = true;
    this.notasError = '';
    this.notasPorClase = [];

    this.notasSvc.getNotas(alumnoId).subscribe({
      next: (items) => {
        this.notasPorClase = this.agruparPorClase(items);
        this.loadingNotas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.notasError = alumnoId
          ? 'Error cargando notas del alumno'
          : 'Error cargando notas';
        this.loadingNotas = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ===== PADRE: HIJOS =====
  private cargarMisHijos() {
    this.loadingHijos = true;
    this.hijosError = '';

    this.notasSvc.getMisHijos().subscribe({
      next: (data) => {
        this.misHijos = data;
        this.loadingHijos = false;

        if (this.misHijos.length === 0) {
          // no hay vínculo -> mandar a pantalla de vincular
          this.router.navigateByUrl('/vincular-hijo');
          return;
        }
        // si solo tiene 1 hijo, lo seleccionamos automáticamente y cargamos notas
        if (this.misHijos.length === 1) {
          this.selectedAlumnoId = this.misHijos[0].alumnoId;
          this.cargarNotas(this.selectedAlumnoId); 
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.hijosError = 'Error cargando hijos';
        this.loadingHijos = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSelectHijo(ev: Event) {
    const value = (ev.target as HTMLSelectElement).value;
    const id = Number(value);
    if (!id) return;

    this.selectedAlumnoId = id;
    this.cargarNotas(id); 
  }

  // ===== Agrupación =====
  private agruparPorClase(items: NotaItem[]): NotasGrupoClase[] {
    const map = new Map<number, NotasGrupoClase>();

    for (const it of items) {
      if (!map.has(it.claseId)) {
        map.set(it.claseId, {
          claseId: it.claseId,
          nombreClase: it.nombreClase,
          items: []
        });
      }
      map.get(it.claseId)!.items.push(it);
    }

    const grupos = Array.from(map.values())
      .sort((a, b) => a.nombreClase.localeCompare(b.nombreClase));

    // dentro de cada clase: orden por fechaEntrega 
    for (const g of grupos) {
      g.items.sort((a, b) => {
        const aTime = a.fechaEntrega ? new Date(a.fechaEntrega).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.fechaEntrega ? new Date(b.fechaEntrega).getTime() : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
    }

    return grupos;
  }
}

// ===== Tipos =====
export interface NotaItem {
  claseId: number;
  nombreClase: string;
  publicacionId: number;
  titulo: string;
  tipo: 'Tarea' | 'Examen';
  fechaEntrega: string | null;      
  fechaEntregada?: string | null;    
  nota: number | null;
  puntuacionMaxima: number | null;   
}

export interface NotasGrupoClase {
  claseId: number;
  nombreClase: string;
  items: NotaItem[];
}

export interface PadreHijoItem {
  alumnoId: number;
  nombre: string;
}