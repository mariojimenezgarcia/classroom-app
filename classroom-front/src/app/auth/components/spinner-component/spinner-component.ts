import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner-component.html',
})
export class SpinnerComponent {
  @Input() text: string = 'Cargando...';
  @Input() fullscreen: boolean = false;
}