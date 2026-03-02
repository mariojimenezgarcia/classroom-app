import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from "@angular/router";
import { PerfilServices } from '../../services/perfil.services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil-page.html',
})
export class PerfilPage {

  userId = Number(localStorage.getItem('userId'));

  rol = (localStorage.getItem('rol') || '').toLowerCase().trim();

  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  codigoAlumno = '';

  loading = true;
  saving = false;
  error = '';
  successMsg = '';

  // Foto
  apiBaseUrl = environment.apiUrl;
  fotoUrlBackend: string | null = null;   
  fotoPreviewUrl: string | null = null; 
  fotoSeleccionada: File | null = null;
  fotoSeleccionadaNombre = '';

  //Boton : "Quitar"
  quitarFoto = false;

  constructor(
    private router: Router,
    private perfilSvc: PerfilServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.userId) {
      this.error = 'Usuario no válido. Vuelve a iniciar sesión.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.perfilSvc.getUsuarioById(this.userId).subscribe({
      next: (res: any) => {
        this.nombre = res?.nombre ?? '';
        this.email = res?.email ?? '';
        this.codigoAlumno = res?.codigoAlumno ?? '';
        this.fotoUrlBackend = res?.fotoUrl ?? null;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error cargando perfil';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    // liberar blob preview si existe
    if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);
  }

  // src final que se pinta en el <img>
  get fotoSrc(): string {
    if (this.fotoPreviewUrl) return this.fotoPreviewUrl;

    // si el usuario dio a quitar, mostramos placeholder
    if (this.quitarFoto) return 'images/usuario.png';

    if (this.fotoUrlBackend) {
      const u = this.fotoUrlBackend.toString().trim();
      if (!u) return 'images/usuario.png';
      if (u.startsWith('http://') || u.startsWith('https://')) return u;
      return `${this.apiBaseUrl}${u}`;
    }

    return 'images/usuario.png';
  }

  onFotoSeleccionada(event: any) {
    const file: File | undefined = event?.target?.files?.[0];
    if (!file) return;

    // valida imagen
    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes.';
      this.cdr.detectChanges();
      return;
    }

    // liberar preview anterior
    if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);

    this.fotoSeleccionada = file;
    this.fotoSeleccionadaNombre = file.name;
    this.fotoPreviewUrl = URL.createObjectURL(file);

    // si selecciona nueva foto, se entiende que ya no quiere quitarla
    this.quitarFoto = false;

    this.cdr.detectChanges();
  }

  quitarFotoLocal() {
    // solo afecta a UI; se persiste al guardar (PUT)
    if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);

    this.fotoSeleccionada = null;
    this.fotoSeleccionadaNombre = '';
    this.fotoPreviewUrl = null;

    this.quitarFoto = true;
    this.cdr.detectChanges();
  }

  cancelar() {
    this.router.navigate(['/home']);
  }

  guardar() {
    this.error = '';
    this.successMsg = '';

    if (!this.nombre.trim() || !this.email.trim()) {
      this.error = 'Nombre y email son obligatorios';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.trim() || this.confirmPassword.trim()) {
      if (this.password.trim().length < 6) {
        this.error = 'La contraseña debe tener al menos 6 caracteres';
        this.cdr.detectChanges();
        return;
      }
      if (this.password.trim() !== this.confirmPassword.trim()) {
        this.error = 'Las contraseñas no coinciden';
        this.cdr.detectChanges();
        return;
      }
    }

    this.saving = true;
    this.cdr.detectChanges();

    //  PUT con FormData
    const fd = new FormData();
    fd.append('nombre', this.nombre.trim());
    fd.append('email', this.email.trim());

    if (this.password.trim()) {
      fd.append('password', this.password.trim());
    }

    // si seleccionó una foto, se envía
    if (this.fotoSeleccionada) {
      fd.append('foto', this.fotoSeleccionada);
    }

    // flag para que el backend la quite con PUT
    fd.append('quitarFoto', this.quitarFoto ? 'true' : 'false');

    this.perfilSvc.editarUsuario(this.userId, fd).subscribe({
      next: (res: any) => {
        this.successMsg = res?.message ?? 'Perfil actualizado correctamente';

        // limpiar contraseñas
        this.password = '';
        this.confirmPassword = '';

        // si backend devuelve la foto, la actualizamos
        if (res?.fotoUrl !== undefined) {
          this.fotoUrlBackend = res?.fotoUrl ?? null;
          localStorage.setItem('fotoUrl', (res?.fotoUrl ?? '').toString());
        }

        // si backend devuelve codigoAlumno 
        if (res?.codigoAlumno !== undefined) {
          this.codigoAlumno = res?.codigoAlumno ?? '';
          localStorage.setItem('codigoAlumno', (this.codigoAlumno ?? '').toString());
        }

        // reset preview si ya se guardó
        if (this.fotoPreviewUrl) URL.revokeObjectURL(this.fotoPreviewUrl);
        this.fotoPreviewUrl = null;
        this.fotoSeleccionada = null;
        this.fotoSeleccionadaNombre = '';

        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error guardando cambios';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('rol');
    localStorage.removeItem('userId');
    localStorage.removeItem('fotoUrl');
    localStorage.removeItem('codigoAlumno');

    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }
}