import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

type Rol = 'admin' | 'profesor' | 'alumno' | 'padres';

type SideItem = {
  label: string;
  route: string;
  icon: 'admin' | 'calendar' | 'home' | 'notas' | 'añadir';
  roles?: Rol[];
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  @Input() title = 'Classroom';
  @Input() isCollapsed = false;

  // avisa al layout para cerrar el sidebar
  @Output() itemClick = new EventEmitter<void>();

  rol: Rol | '' = (localStorage.getItem('rol') || '').trim().toLowerCase() as Rol;

  items: SideItem[] = [
    { label: 'Admin', route: '/home/admin', icon: 'admin', roles: ['admin'] },
    { label: 'Inicio', route: '/home', icon: 'home', roles: ['admin', 'profesor', 'alumno'] },
    { label: 'Notas', route: '/notas', icon: 'notas', roles: ['padres', 'alumno'] },
    { label: 'Añadir hijo', route: '/padres', icon: 'añadir', roles: ['padres'] },
    { label: 'Calendar', route: '/calendar', icon: 'calendar' },
  ];

  get menuItems(): SideItem[] {
    return this.items.filter(it => {
      if (!it.roles || it.roles.length === 0) return true;
      if (!this.rol) return false;
      return it.roles.includes(this.rol as Rol);
    });
  }

  trackByRoute(_: number, it: SideItem) {
    return it.route;
  }

  iconPath(icon: SideItem['icon']): string {
    switch (icon) {
      case 'home': return 'images/home.png';
      case 'calendar': return 'images/calendario.png';
      case 'admin': return 'images/admin-icon.png';
      case 'notas': return 'images/notas.png';
      case 'añadir': return 'images/padreHijo.png';
      default: return '';
    }
  }
  //cierra el sidevar en movil
  onItemClick() {
    this.itemClick.emit();
  }
}