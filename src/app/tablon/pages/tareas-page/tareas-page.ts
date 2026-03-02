import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TablonServices } from '../../services/tablon.services';
import { CardPublicacion } from '../../components/card-publicacion/card-publicacion';

@Component({
  selector: 'app-tareas-page',
  standalone: true,
  imports: [CommonModule, CardPublicacion],
  templateUrl: './tareas-page.html'
})
export class TareasPage {

  claseId = 0;
  publicaciones: any[] = [];
  tareas: any[] = [];

  miUsuarioId = Number(localStorage.getItem('userId') || 0);
  rol = (localStorage.getItem('rol') || '').trim().toLowerCase();

  constructor(
     private route: ActivatedRoute,
     private tablonSvc: TablonServices,
     private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.claseId = Number(this.route.snapshot.paramMap.get('claseId'));
    this.cargar();
  }

  cargar(): void {
    this.tablonSvc.getPublicacionesByClaseId(this.claseId).subscribe({
      next: (res) => {
        this.publicaciones = res ?? [];
        this.tareas = this.publicaciones.filter(p => p?.tipo !== 0); 
        console.log('tareas', this.tareas);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
  quitarPublicacion(id: number) {
    this.tareas = this.tareas.filter(p => p.id !== id);
    this.cdr.detectChanges();
  }
}