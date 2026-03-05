import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../../shared/icons.module';

@Component({
  selector: 'app-footer',
  standalone: true, 
  imports: [
    CommonModule, 
    IconsModule,
    RouterModule
  ],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {

  constructor(private readonly router: Router) {}

  // Funciones de navegación para los enlaces del footer
  navTo(route: string): void {
    this.router.navigate([route]);
  }

  // Función para volver al inicio (scroll top)
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}