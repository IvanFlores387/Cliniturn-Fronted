import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Appointment } from '../../../core/models/appointment.model';
import { PaginationMeta } from '../../../core/models/paginated-response.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';
import { SimplePaginationComponent } from '../../../shared/components/appointment-status-chip/simple-pagination/simple-pagination';
import { DateTimeHelper } from '../../../shared/utils/date-time.helper';

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppointmentStatusChipComponent,
    SimplePaginationComponent,
  ],
  templateUrl: './admin-citas.html',
  styleUrl: './admin-citas.scss',
})
export class AdminCitasComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');
  readonly paginationMeta = signal<PaginationMeta | null>(null);

  estadoFiltro = '';
  fechaFiltro = '';
  medicoFiltro = '';
  especialidadFiltro = '';

  currentPage = 1;
  readonly pageSize = 10;

  readonly formatDate = DateTimeHelper.formatDate;
  readonly formatTime = DateTimeHelper.formatTime;

  readonly hasAppointments = computed(() => this.appointments().length > 0);

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(page = 1): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.currentPage = page;

    this.appointmentsService.getAll({
      estado: this.estadoFiltro || undefined,
      fecha: this.fechaFiltro || undefined,
      medico: this.medicoFiltro || undefined,
      especialidad: this.especialidadFiltro || undefined,
      page: this.currentPage,
      limit: this.pageSize,
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.appointments.set(response.items ?? []);
        this.paginationMeta.set(response.meta ?? null);
        this.loading.set(false);
      },
      error: (err) => {
        const message =
          err?.error?.message || 'No se pudieron cargar las citas.';

        this.loading.set(false);
        this.appointments.set([]);
        this.paginationMeta.set(null);
        this.errorMessage.set(message);
        this.notificationService.error(message);
      }
    });
  }

  applyFilters(): void {
    this.loadAppointments(1);
  }

  clearFilters(): void {
    this.estadoFiltro = '';
    this.fechaFiltro = '';
    this.medicoFiltro = '';
    this.especialidadFiltro = '';
    this.loadAppointments(1);
  }

  onPageChange(page: number): void {
    if (page === this.currentPage) {
      return;
    }

    this.loadAppointments(page);
  }

  trackByAppointmentId(_: number, item: Appointment): number {
    return item.id;
  }
}
