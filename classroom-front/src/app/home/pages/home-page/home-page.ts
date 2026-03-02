import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardClass } from '../../components/card-class/card-class';
import { AdminUsuarioClases, HomeService } from '../../services/home.services';


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, CardClass],
  templateUrl: './home-page.html',
})
export class HomePage implements OnInit {
  rol = (localStorage.getItem('rol') || '').toLowerCase();

  adminRows: AdminUsuarioClases[] = [];
  loadingAdmin = false;
  adminError = '';

  constructor(private homeService: HomeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.rol === 'admin') {
      this.loadingAdmin = true;
      this.homeService.getUsuariosConClases().subscribe({
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
}
