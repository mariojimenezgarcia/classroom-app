import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeService } from '../../services/home.services';

@Component({
  selector: 'app-editar-clase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-clase.html',
})
export class EditarClase {

  claseId = 0;

  // fields del form
  nombre = '';
  curso = '';
  aula = '';
  color = '';

  loading = true;
  saving = false;
  error = '';
  successMsg = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private homeSvc: HomeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Clase inválida';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.claseId = id;

    // Cargar datos
    this.homeSvc.getClaseById(id).subscribe({
      next: (res) => {
        this.nombre = res.nombre ?? '';
        this.curso = res.curso ?? '';
        this.aula = res.aula ?? '';
        this.color = res.color ?? '';

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando la clase';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelar() {
    this.router.navigate(['/home']);
  }

  guardar() {
    this.error = '';
    this.successMsg = '';

    if (!this.nombre.trim() || !this.curso.trim() || !this.aula.trim() || !this.color.trim()) {
      this.error = 'Rellena todos los campos';
      this.cdr.detectChanges();
      return;
    }

    this.saving = true;
    this.cdr.detectChanges();

    this.homeSvc.editarClase(this.claseId, {
      nombre: this.nombre.trim(),
      curso: this.curso.trim(),
      aula: this.aula.trim(),
      color: this.color.trim(),
    }).subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = 'Clase actualizada correctamente';
        this.cdr.detectChanges();

        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error guardando cambios';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
