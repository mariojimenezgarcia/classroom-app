import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../../services/home.services';
import { CommonModule } from '@angular/common';

interface PersonaClase {
  usuarioId: number;
  nombre: string;
  email: string;
  rol: string; 
}

interface ClasePersonasResponse {
  claseId: number;
  nombreClase: string;
  curso: string;
  aula: string;
  personas: PersonaClase[];
}
@Component({
  selector: 'app-mostrar-alumnos',
  imports: [CommonModule],
  templateUrl: './mostrar-alumnos.html',
})
export class MostrarAlumnos {
 // cabecera clase
  claseId = 0;
  nombreClase = '';
  curso = '';
  aula = '';

  // tabla
  personas: PersonaClase[] = [];

  loading = true;
  error = '';

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

    this.loading = true;

    this.homeSvc.alumnosClase(id).subscribe({
      next: (res: ClasePersonasResponse) => {
        this.claseId = res.claseId;
        this.nombreClase = res.nombreClase;
        this.curso = res.curso;
        this.aula = res.aula;
        this.personas = res.personas ?? [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando personas de la clase';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  volver() {
    this.router.navigate(['/home']);
  }
  esProfesor(p: PersonaClase) {
    return (p.rol || '').toLowerCase() === 'profesor';
  }
}
