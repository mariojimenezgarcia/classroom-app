import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-encabezado-clase',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './encabezado-clase.html'
})
export class EncabezadoClase {

  @Input() claseId = 0;

  // datos clase
  @Input() nombre = '';
  @Input() curso = '';
  @Input() aula = '';
  @Input() color = '';
  @Input() rol = '';
}