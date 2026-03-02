import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../home/components/navbar/navbar';
import { Sidebar } from '../../../home/components/sidebar/sidebar';

@Component({
  selector: 'app-perfil-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar],
  templateUrl: './perfil-layout.html',
})
export class PerfilLayout {

  isCollapsed = false;

  // Móvil (drawer)
  isSidebarOpen = false;

  toggleSidebar() {
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
}