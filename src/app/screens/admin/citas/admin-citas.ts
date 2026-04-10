import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';

@Component({
  selector: 'app-admin-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentStatusChipComponent],
  templateUrl: './admin-citas.html',
  styleUrl: './admin-citas.scss',
})
export class AdminCitasComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointments = signal<Appointment[]>([]);
  readonly filteredAppointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  estadoFiltro = '';
  fechaFiltro = '';
  medicoFiltro = '';
  especialidadFiltro = '';

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentsService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.appointments.set(data);
          this.applyFilters();
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'No se pudieron cargar las citas.');
        }
      });
  }

  applyFilters(): void {
    let data = [...this.appointments()];

    if (this.estadoFiltro) {
      data = data.filter(item => item.estado === this.estadoFiltro);
    }

    if (this.fechaFiltro) {
      data = data.filter(item => item.fecha === this.fechaFiltro);
    }

    if (this.medicoFiltro.trim()) {
      const value = this.medicoFiltro.toLowerCase().trim();
      data = data.filter(item =>
        `${item.doctor_nombre ?? ''} ${item.doctor_apellidos ?? ''}`.toLowerCase().includes(value)
      );
    }

    if (this.especialidadFiltro.trim()) {
      const value = this.especialidadFiltro.toLowerCase().trim();
      data = data.filter(item =>
        (item.specialty_nombre ?? '').toLowerCase().includes(value)
      );
    }

    this.filteredAppointments.set(data);
  }

  clearFilters(): void {
    this.estadoFiltro = '';
    this.fechaFiltro = '';
    this.medicoFiltro = '';
    this.especialidadFiltro = '';
    this.applyFilters();
  }

  trackByAppointmentId(_: number, item: Appointment): number {
    return item.id;
  }
}
