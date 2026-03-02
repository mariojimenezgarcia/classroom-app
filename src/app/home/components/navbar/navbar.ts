import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {
  rol = (localStorage.getItem('rol') || '').toLowerCase();

  @Output() toggleSidebar = new EventEmitter<void>();

  apiBaseUrl = environment.apiUrl;
  fotoUrl: string | null = null;

  ngOnInit() {
    this.cargarFotoDesdeStorage();
    window.addEventListener('storage', this.onStorageChange);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.onStorageChange);
  }

  private onStorageChange = (e: StorageEvent) => {
    if (e.key === 'fotoUrl') this.cargarFotoDesdeStorage();
  };

  cargarFotoDesdeStorage() {
    const v = (localStorage.getItem('fotoUrl') || '').trim();
    this.fotoUrl = v || null;
  }

  get fotoSrc(): string {
    const u = (this.fotoUrl ?? '').trim();
    if (!u) return 'images/usuario.png';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return `${this.apiBaseUrl}${u}`;
  }

  onFotoError() {
    this.fotoUrl = null;
  }

  // Blindado: evita que dispare cosas raras
  onToggle(ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.toggleSidebar.emit();
  }
}