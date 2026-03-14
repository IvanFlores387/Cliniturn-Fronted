import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { IconsModule } from '../../shared/icons.module';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    IconsModule
  ],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {

  constructor(private readonly router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}