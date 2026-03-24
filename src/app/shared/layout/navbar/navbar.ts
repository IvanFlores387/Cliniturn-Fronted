import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }

  get userName(): string {
    return this.authService.getCurrentUser()?.nombre ?? 'Usuario';
  }

  get roleLabel(): string {
    const role = this.authService.getRole();

    if (role === 'admin') return 'Admin';
    if (role === 'medico') return 'Médico';
    if (role === 'paciente') return 'Paciente';
    return 'Usuario';
  }
}
