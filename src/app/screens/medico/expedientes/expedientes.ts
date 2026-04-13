import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';

interface DoctorPatientRecord {
  patientKey: string;
  patientId: number | null;
  patientName: string;
  specialtyNames: string[];
  totalAppointments: number;
  attendedAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  lastAppointment: Appointment | null;
  nextAppointment: Appointment | null;
  appointments: Appointment[];
}

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentStatusChipComponent],
  templateUrl: './expedientes.html',
  styleUrl: './expedientes.scss',
})
export class ExpedientesComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly selectedPatientKey = signal<string | null>(null);

  search = '';
  estadoFiltro = '';

  readonly patientRecords = computed<DoctorPatientRecord[]>(() => {
    const now = new Date();
    const grouped = new Map<string, Appointment[]>();

    for (const appointment of this.appointments()) {
      const patientId = appointment.paciente_id ?? null;
      const patientName = this.buildPatientName(appointment);

      const key =
        patientId !== null
          ? `patient-${patientId}`
          : `name-${patientName.toLowerCase()}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)?.push(appointment);
    }

    let records = Array.from(grouped.entries()).map(([key, items]) => {
      const orderedDesc = [...items].sort((a, b) => {
        return this.getAppointmentDate(b).getTime() - this.getAppointmentDate(a).getTime();
      });

      const pastAppointments = [...items]
        .filter((item) => this.getAppointmentDate(item).getTime() < now.getTime())
        .sort((a, b) => {
          return this.getAppointmentDate(b).getTime() - this.getAppointmentDate(a).getTime();
        });

      const upcomingAppointments = [...items]
        .filter((item) => {
          const appointmentDate = this.getAppointmentDate(item).getTime();
          return (
            appointmentDate >= now.getTime() &&
            ['pendiente', 'confirmada'].includes(item.estado)
          );
        })
        .sort((a, b) => {
          return this.getAppointmentDate(a).getTime() - this.getAppointmentDate(b).getTime();
        });

      const specialtyNames = Array.from(
        new Set(
          items
            .map((item) => item.specialty_nombre?.trim())
            .filter((value): value is string => !!value)
        )
      );

      const firstItem = orderedDesc[0];

      return {
        patientKey: key,
        patientId: firstItem?.paciente_id ?? null,
        patientName: this.buildPatientName(firstItem),
        specialtyNames,
        totalAppointments: items.length,
        attendedAppointments: items.filter((item) => item.estado === 'atendida').length,
        pendingAppointments: items.filter((item) => item.estado === 'pendiente').length,
        confirmedAppointments: items.filter((item) => item.estado === 'confirmada').length,
        cancelledAppointments: items.filter((item) => item.estado === 'cancelada').length,
        lastAppointment: pastAppointments[0] ?? null,
        nextAppointment: upcomingAppointments[0] ?? null,
        appointments: orderedDesc,
      };
    });

    const query = this.search.trim().toLowerCase();
    const estado = this.estadoFiltro.trim().toLowerCase();

    if (estado) {
      records = records.filter((record) =>
        record.appointments.some((item) => item.estado === estado)
      );
    }

    if (query) {
      records = records.filter((record) => {
        const specialties = record.specialtyNames.join(' ').toLowerCase();
        const consultorios = record.appointments
          .map((item) => item.consultorio_nombre ?? '')
          .join(' ')
          .toLowerCase();

        return (
          record.patientName.toLowerCase().includes(query) ||
          specialties.includes(query) ||
          consultorios.includes(query)
        );
      });
    }

    return records.sort((a, b) => a.patientName.localeCompare(b.patientName, 'es'));
  });

  readonly selectedRecord = computed<DoctorPatientRecord | null>(() => {
    const selectedKey = this.selectedPatientKey();

    if (!selectedKey) {
      return null;
    }

    return this.patientRecords().find((item) => item.patientKey === selectedKey) ?? null;
  });

  readonly totalPacientes = computed<number>(() => this.patientRecords().length);

  readonly totalAtendidos = computed<number>(() => {
    return this.patientRecords().filter((item) => item.attendedAppointments > 0).length;
  });

  readonly totalConPendientes = computed<number>(() => {
    return this.patientRecords().filter((item) => item.pendingAppointments > 0).length;
  });

  constructor() {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);

    this.appointmentsService
      .getDoctorAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Appointment[]) => {
          this.appointments.set(data ?? []);

          const currentSelectedKey = this.selectedPatientKey();
          const currentRecords = this.patientRecords();

          if (currentSelectedKey) {
            const selectedStillExists = currentRecords.some(
              (record) => record.patientKey === currentSelectedKey
            );

            if (!selectedStillExists) {
              this.selectedPatientKey.set(null);
            }
          }

          if (!this.selectedPatientKey() && currentRecords.length > 0) {
            this.selectedPatientKey.set(currentRecords[0].patientKey);
          }

          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los expedientes del médico.'
          );
        },
      });
  }

  clearFilters(): void {
    this.search = '';
    this.estadoFiltro = '';
  }

  selectPatient(record: DoctorPatientRecord): void {
    this.selectedPatientKey.set(record.patientKey);
  }

  formatTime(value: string | null | undefined): string {
    if (!value) {
      return '--:--';
    }

    return value.length >= 5 ? value.slice(0, 5) : value;
  }

  trackByPatientKey(_: number, item: DoctorPatientRecord): string {
    return item.patientKey;
  }

  trackByAppointmentId(_: number, item: Appointment): number {
    return item.id;
  }

  private getAppointmentDate(appointment: Appointment): Date {
    return new Date(`${appointment.fecha}T${appointment.hora_inicio}`);
  }

  private buildPatientName(appointment?: Appointment | null): string {
    if (!appointment) {
      return 'Paciente sin nombre';
    }

    const nombre = appointment.paciente_nombre?.trim() ?? '';
    const apellidos = appointment.paciente_apellidos?.trim() ?? '';
    const fullName = `${nombre} ${apellidos}`.trim();

    return fullName || 'Paciente sin nombre';
  }
}
