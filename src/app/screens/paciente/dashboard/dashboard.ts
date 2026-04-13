import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../services/auth.service';
import { DashboardService } from '../../../services/dashboard.service';
import { NotificationService } from '../../../services/notification.service';
import { PatientDashboardData } from '../../../core/models/dashboard.model';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    AppointmentStatusChipComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly dashboard = signal<PatientDashboardData | null>(null);

  readonly currentUser = computed(() => this.authService.user());

  readonly firstName = computed(() => {
    const nombreCompleto = this.currentUser()?.nombre ?? '';
    return nombreCompleto.split(' ')[0] || 'Usuario';
  });

  stats = [
    { label: 'Total de Citas', value: 4, icon: 'calendar', tone: 'blue' },
    { label: 'Pendientes', value: 1, icon: 'circle-alert', tone: 'yellow' },
    { label: 'Confirmadas', value: 1, icon: 'check-circle2', tone: 'green' },
    { label: 'Completadas', value: 1, icon: 'activity', tone: 'purple' }
  ];

  upcomingAppointments = [
    {
      especialidad: 'Medicina General',
      estado: 'Confirmada',
      medico: 'Dr. Carlos Rodríguez',
      fecha: '10 de febrero, 2026',
      hora: '10:00',
      consultorio: 'Consultorio A',
      motivo: 'Consulta de seguimiento general',
      tone: 'green'
    },
    {
      especialidad: 'Psicología',
      estado: 'Pendiente',
      medico: 'Dra. Laura Hernández',
      fecha: '15 de febrero, 2026',
      hora: '14:00',
      consultorio: 'Consultorio Psicología',
      motivo: 'Manejo de estrés académico',
      tone: 'yellow'
    }
  ];

  historyAppointments = [
    {
      especialidad: 'Odontología',
      estado: 'Cancelada',
      medico: 'Dr. Miguel Sánchez',
      fecha: '25 de enero, 2026',
      hora: '09:00',
      consultorio: 'Consultorio Dental',
      motivo: 'Limpieza dental',
      tone: 'red',
      cancelacion: 'Conflicto de horarios con examen'
    },
    {
      especialidad: 'Medicina General',
      estado: 'Completada',
      medico: 'Dr. Carlos Rodríguez',
      fecha: '20 de enero, 2026',
      hora: '11:00',
      consultorio: 'Consultorio A',
      motivo: 'Revisión general',
      tone: 'blue'
    }
  ];

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.dashboardService
      .getPatientDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo cargar el dashboard del paciente.'
          );
        },
      });
  }

  formatTime(value: string): string {
    return value?.slice(0, 5) || value;
  }

  toAppointmentStatus(status: string | null | undefined): AppointmentStatus {
    const normalized = (status ?? '').trim().toLowerCase();

    switch (normalized) {
      case 'pendiente':
        return 'pendiente';

      case 'confirmada':
      case 'confirmado':
        return 'confirmada';

      case 'cancelada':
      case 'cancelado':
        return 'cancelada';

      case 'atendida':
      case 'completada':
      case 'completado':
        return 'atendida';

      default:
        return 'pendiente';
    }
  }
}
