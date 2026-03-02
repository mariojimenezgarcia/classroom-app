import { ChangeDetectorRef, Component } from '@angular/core';
import { AdminUsuarioClases, HomeService } from '../../services/home.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  rol = (localStorage.getItem('rol') || '').toLowerCase();

  adminRows: AdminUsuarioClases[] = [];
  loadingAdmin = false;
  adminError = '';

  constructor(private homeSvc: HomeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.rol === 'admin') {
      this.loadingAdmin = true;
      this.homeSvc.getUsuariosConClases().subscribe({
        next: (data) => {
          this.adminRows = data;
          this.loadingAdmin = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.adminError = 'Error cargando usuarios';
          console.error(err);
          this.loadingAdmin = false;
           this.cdr.detectChanges();
        }
      });
    }
  }
  borrarUsuario(id: number) {
    if (!confirm('¿Seguro que quieres borrar este usuario y TODO lo relacionado?')) return;

    this.homeSvc.borrarUsuario(id).subscribe({
      next: () => {
        this.adminRows = this.adminRows.filter(x => x.usuarioId !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
}

