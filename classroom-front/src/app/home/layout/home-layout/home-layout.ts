import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar],
  templateUrl: './home-layout.html',
})
export class HomeLayout {
  isCollapsed = false;
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