import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';
import { ConfirmDialogComponent } from '../../../shared/components/appointment-status-chip/confirm-dialog/confirm-dialog';

type DoctorAction = 'confirm' | 'cancel' | 'attended' | null;

@Component({
  selector: 'app-medico-mis-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppointmentStatusChipComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './medico-mis-citas.html',
  styleUrl: './medico-mis-citas.scss',
})
export class MedicoMisCitasComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointments = signal<Appointment[]>([]);
  readonly filteredAppointments = signal<Appointment[]>([]);
  readonly loading = signal(true);
  readonly processingId = signal<number | null>(null);

  readonly selectedAppointment = signal<Appointment | null>(null);
  readonly currentAction = signal<DoctorAction>(null);
  readonly showActionDialog = signal(false);

  estadoFiltro = '';
  fechaFiltro = '';

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);

    this.appointmentsService.getDoctorAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.appointments.set(data);
          this.applyFilters();
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar las citas del médico.'
          );
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

    this.filteredAppointments.set(data);
  }

  canConfirm(item: Appointment): boolean {
    return item.estado === 'pendiente';
  }

  canCancel(item: Appointment): boolean {
    return item.estado === 'pendiente' || item.estado === 'confirmada';
  }

  canAttend(item: Appointment): boolean {
    return item.estado === 'pendiente' || item.estado === 'confirmada';
  }

  openActionDialog(item: Appointment, action: DoctorAction): void {
    this.selectedAppointment.set(item);
    this.currentAction.set(action);
    this.showActionDialog.set(true);
  }

  closeActionDialog(): void {
    if (!this.processingId()) {
      this.selectedAppointment.set(null);
      this.currentAction.set(null);
      this.showActionDialog.set(false);
    }
  }

  get dialogTitle(): string {
    switch (this.currentAction()) {
      case 'confirm':
        return 'Confirmar cita';
      case 'cancel':
        return 'Cancelar cita';
      case 'attended':
        return 'Marcar cita como atendida';
      default:
        return 'Confirmar acción';
    }
  }

  get dialogMessage(): string {
    const item = this.selectedAppointment();
    const patient = item ? `${item.paciente_nombre} ${item.paciente_apellidos}` : 'este paciente';

    switch (this.currentAction()) {
      case 'confirm':
        return `¿Deseas confirmar la cita de ${patient}?`;
      case 'cancel':
        return `¿Deseas cancelar la cita de ${patient}?`;
      case 'attended':
        return `¿Deseas marcar como atendida la cita de ${patient}?`;
      default:
        return '¿Deseas continuar?';
    }
  }

  get dialogVariant(): 'primary' | 'danger' | 'success' {
    switch (this.currentAction()) {
      case 'confirm':
        return 'primary';
      case 'cancel':
        return 'danger';
      case 'attended':
        return 'success';
      default:
        return 'primary';
    }
  }

  get confirmButtonText(): string {
    switch (this.currentAction()) {
      case 'confirm':
        return 'Sí, confirmar';
      case 'cancel':
        return 'Sí, cancelar';
      case 'attended':
        return 'Sí, marcar';
      default:
        return 'Confirmar';
    }
  }

  executeAction(): void {
    const item = this.selectedAppointment();
    const action = this.currentAction();

    if (!item || !action) return;

    this.processingId.set(item.id);

    let request$;

    switch (action) {
      case 'confirm':
        request$ = this.appointmentsService.confirm(item.id);
        break;
      case 'cancel':
        request$ = this.appointmentsService.cancel(item.id, 'Cancelada por el médico');
        break;
      case 'attended':
        request$ = this.appointmentsService.attended(item.id);
        break;
      default:
        return;
    }

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const successText =
            action === 'confirm'
              ? 'La cita fue confirmada correctamente.'
              : action === 'cancel'
                ? 'La cita fue cancelada correctamente.'
                : 'La cita fue marcada como atendida.';

          this.processingId.set(null);
          this.closeActionDialog();
          this.notificationService.success(successText);
          this.loadAppointments();
        },
        error: (err) => {
          this.processingId.set(null);
          this.closeActionDialog();
          this.notificationService.error(
            err?.error?.message || 'No se pudo actualizar la cita.'
          );
        }
      });
  }

  trackByAppointmentId(_: number, item: Appointment): number {
    return item.id;
  }
}
