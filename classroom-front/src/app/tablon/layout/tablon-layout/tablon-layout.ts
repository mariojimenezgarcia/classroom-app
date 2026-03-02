import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Navbar } from '../../../home/components/navbar/navbar';
import { Sidebar } from '../../../home/components/sidebar/sidebar';
import { TablonServices } from '../../services/tablon.services';
import { EncabezadoClase } from '../../components/encabezado-clase/encabezado-clase';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar, EncabezadoClase],
  templateUrl: './tablon-layout.html',
})
export class TablonLayout {
  claseId = 0;
  nombre = '';
  curso = '';
  aula = '';
  color = '';
  rol = (localStorage.getItem('rol') || '').toLowerCase();
  tabActivo: 'tablon' | 'tareas' | 'info' = 'tablon';

  // Desktop
  isCollapsed = false;

  // Móvil (drawer)
  isSidebarOpen = false;

  constructor(
    private route: ActivatedRoute,
    private tablonSvc: TablonServices,
    private cdr: ChangeDetectorRef
  ) {}

  toggleSidebar() {
    // móvil
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = !this.isSidebarOpen;
      return;
    }
    this.isCollapsed = !this.isCollapsed;
  }

  closeSidebar() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit(): void {
    this.route.firstChild?.paramMap.subscribe(params => {
      const idClaseParam = Number(params.get('claseId') || 0);

      if (idClaseParam) {
        this.cargarClase(idClaseParam);
        localStorage.setItem('claseIdActual', String(idClaseParam));
      } else {
        const guardada = Number(localStorage.getItem('claseIdActual') || 0);
        if (guardada) this.cargarClase(guardada);
      }

      const url = this.route.firstChild?.snapshot.routeConfig?.path || '';
      if (url.includes('tareas')) this.tabActivo = 'tareas';
      else this.tabActivo = 'tablon';

      //cerrar el drawer en movil
      this.closeSidebar();

      this.cdr.detectChanges();
    });
  }

  private cargarClase(id: number) {
    this.claseId = id;

    this.tablonSvc.getClaseById(id).subscribe({
      next: (res) => {
        this.nombre = res.nombre ?? '';
        this.curso = res.curso ?? '';
        this.aula = res.aula ?? '';
        this.color = res.color ?? '';
        this.cdr.detectChanges();
      },
      error: () => {
        localStorage.removeItem('claseIdActual');
      }
    });
  }
}