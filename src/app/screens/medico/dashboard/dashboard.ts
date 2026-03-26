import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly authService = inject(AuthService);

  readonly currentUser = computed(() => this.authService.user());

  readonly doctorName = computed(() => {
    const nombre = this.currentUser()?.nombre ?? 'Médico';
    return nombre.startsWith('Dr.') || nombre.startsWith('Dra.') ? nombre : `Dr. ${nombre}`;
  });

  readonly doctorSubtitle = computed(() => {
    const user = this.currentUser();
    const especialidad = user?.especialidad || 'Especialidad no definida';
    const cedula = user?.cedula || 'Sin cédula registrada';
    return `${especialidad} - Cédula: ${cedula}`;
  });

  stats = [
    { label: 'Total de Citas', value: 2, icon: 'calendar', tone: 'blue' },
    { label: 'Pendientes', value: 0, icon: 'circle-alert', tone: 'yellow' },
    { label: 'Confirmadas', value: 1, icon: 'check-circle2', tone: 'green' },
    { label: 'Completadas', value: 1, icon: 'activity', tone: 'purple' }
  ];
}
