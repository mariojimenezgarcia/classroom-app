import { ChangeDetectorRef, Component } from '@angular/core';
import { Clase, HomeService } from '../../services/home.services';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-class',
  imports: [CommonModule,RouterLink],
  templateUrl: './card-class.html',
})
export class CardClass {
    userId = Number(localStorage.getItem('userId'));
    rol = (localStorage.getItem('rol') || '').toLowerCase();
    clases: Clase[] = [];
    loading = true;

    constructor(private homeService: HomeService,
                private cdr: ChangeDetectorRef,
                private router: Router) {}

    ngOnInit(): void {
      this.homeService.getMisClases().subscribe({
        next: (data) => {
          this.clases = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando clases', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
    irATablon(idClase: number) {
      this.router.navigate(['/tablon/mostrarClase', idClase]);
    }
    //boton de ver codigo de Accceso
    verCodigo(id: number) {
      this.router.navigate(['/clase', id, 'codigo']);
    }
    //3 puntos para editar y borrar una clase 
    menuAbierto: number | null = null;

    toggleMenu(id: number) {
      this.menuAbierto = this.menuAbierto === id ? null : id;
    }

    editarClase(id: number) {
      this.menuAbierto = null;
      console.log('Editar clase', id);
      this.router.navigate(['/home/editarClase', id]);
    }

    borrarClase(id: number) {
        this.menuAbierto = null;

        const confirmar = confirm('¿Seguro que quieres continuar?');
        if (!confirmar) return;

        this.homeService.salirDeClase(id).subscribe({
          next: () => {
            this.clases = this.clases.filter(c => c.id !== id);
            this.cdr.detectChanges();
          },
          error: (err) => {
            alert(err?.error?.message ?? 'Error procesando la acción');
          }
        });
      }

}
