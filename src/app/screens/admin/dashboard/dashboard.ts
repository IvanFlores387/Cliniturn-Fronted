import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardService } from '../../../services/dashboard.service';
import { NotificationService } from '../../../services/notification.service';
import { AdminDashboardData } from '../../../core/models/dashboard.model';
import { AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppointmentStatusChipComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly dashboard = signal<AdminDashboardData | null>(null);

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.dashboardService
      .getAdminDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.dashboard.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo cargar el dashboard del administrador.'
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
