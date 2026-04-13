import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';
import { ConfirmDialogComponent } from '../../../shared/components/appointment-status-chip/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-paciente-mis-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppointmentStatusChipComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './paciente-mis-citas.html',
  styleUrl: './paciente-mis-citas.scss',
})
export class PacienteMisCitasComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly processingId = signal<number | null>(null);

  readonly showCancelDialog = signal(false);
  readonly selectedAppointment = signal<Appointment | null>(null);

  estadoFiltro = '';
  fechaFiltro = '';
  textoFiltro = '';

  readonly filteredAppointments = computed(() => {
    let data = [...this.appointments()];

    if (this.estadoFiltro) {
      data = data.filter((item) => item.estado === this.estadoFiltro);
    }

    if (this.fechaFiltro) {
      data = data.filter((item) => item.fecha === this.fechaFiltro);
    }

    if (this.textoFiltro.trim()) {
      const query = this.textoFiltro.trim().toLowerCase();

      data = data.filter((item) => {
        const doctor = `${item.doctor_nombre ?? ''} ${item.doctor_apellidos ?? ''}`.toLowerCase();
        const specialty = `${item.specialty_nombre ?? ''}`.toLowerCase();
        const consultorio = `${item.consultorio_nombre ?? ''}`.toLowerCase();
        const motivo = `${item.motivo_consulta ?? ''}`.toLowerCase();

        return (
          doctor.includes(query) ||
          specialty.includes(query) ||
          consultorio.includes(query) ||
          motivo.includes(query)
        );
      });
    }

    return data.sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora_inicio}`).getTime();
      const dateB = new Date(`${b.fecha}T${b.hora_inicio}`).getTime();
      return dateB - dateA;
    });
  });

  readonly totalCitas = computed(() => this.appointments().length);
  readonly totalPendientes = computed(
    () => this.appointments().filter((item) => item.estado === 'pendiente').length
  );
  readonly totalConfirmadas = computed(
    () => this.appointments().filter((item) => item.estado === 'confirmada').length
  );
  readonly totalAtendidas = computed(
    () => this.appointments().filter((item) => item.estado === 'atendida').length
  );

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);

    this.appointmentsService
      .getMy()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.appointments.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar tus citas.'
          );
        },
      });
  }

  clearFilters(): void {
    this.estadoFiltro = '';
    this.fechaFiltro = '';
    this.textoFiltro = '';
  }

  canCancel(item: Appointment): boolean {
    return item.estado === 'pendiente' || item.estado === 'confirmada';
  }

  openCancelDialog(item: Appointment): void {
    this.selectedAppointment.set(item);
    this.showCancelDialog.set(true);
  }

  closeCancelDialog(): void {
    if (!this.processingId()) {
      this.showCancelDialog.set(false);
      this.selectedAppointment.set(null);
    }
  }

  confirmCancelAppointment(): void {
    const item = this.selectedAppointment();

    if (!item) {
      return;
    }

    this.processingId.set(item.id);

    this.appointmentsService
      .cancel(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.processingId.set(null);
          this.showCancelDialog.set(false);
          this.selectedAppointment.set(null);
          this.notificationService.success('La cita fue cancelada correctamente.');
          this.loadAppointments();
        },
        error: (err) => {
          this.processingId.set(null);
          this.showCancelDialog.set(false);
          this.selectedAppointment.set(null);
          this.notificationService.error(
            err?.error?.message || 'No se pudo cancelar la cita.'
          );
        },
      });
  }

  trackByAppointmentId(_: number, item: Appointment): number {
    return item.id;
  }
}
