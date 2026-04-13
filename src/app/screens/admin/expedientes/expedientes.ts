import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';
import { AppointmentStatusChipComponent } from '../../../shared/components/appointment-status-chip/appointment-status-chip';

interface AdminPatientRecord {
  patientKey: string;
  patientId: number | null;
  patientName: string;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  attendedAppointments: number;
  cancelledAppointments: number;
  doctors: string[];
  specialties: string[];
  appointments: Appointment[];
  lastAppointment: Appointment | null;
  nextAppointment: Appointment | null;
}

@Component({
  selector: 'app-expedientes-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentStatusChipComponent],
  templateUrl: './expedientes.html',
  styleUrl: './expedientes.scss',
})
export class ExpedientesAdminComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);
  readonly appointments = signal<Appointment[]>([]);
  readonly selectedPatientKey = signal<string | null>(null);

  search = '';
  estadoFiltro = '';
  especialidadFiltro = '';

  readonly records = computed<AdminPatientRecord[]>(() => {
    const appointments = this.appointments();
    const now = new Date();
    const grouped = new Map<string, Appointment[]>();

    for (const appointment of appointments) {
      const patientId = appointment.paciente_id ?? null;
      const patientName = this.buildPatientName(appointment);

      const key =
        patientId !== null
          ? String(patientId)
          : patientName || `sin-paciente-${appointment.id}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key)!.push(appointment);
    }

    let data = Array.from(grouped.entries()).map(([key, items]) => {
      const orderedDesc = [...items].sort(
        (a, b) => this.getAppointmentTime(b) - this.getAppointmentTime(a)
      );

      const orderedAsc = [...items].sort(
        (a, b) => this.getAppointmentTime(a) - this.getAppointmentTime(b)
      );

      const nextAppointment =
        orderedAsc.find((item) => {
          const time = this.getAppointmentTime(item);
          return (
            time >= now.getTime() &&
            ['pendiente', 'confirmada'].includes(item.estado)
          );
        }) ?? null;

      const firstItem = orderedDesc[0] ?? null;

      return {
        patientKey: key,
        patientId: firstItem?.paciente_id ?? null,
        patientName: this.buildPatientName(firstItem),
        totalAppointments: items.length,
        pendingAppointments: items.filter((item) => item.estado === 'pendiente').length,
        confirmedAppointments: items.filter((item) => item.estado === 'confirmada').length,
        attendedAppointments: items.filter((item) => item.estado === 'atendida').length,
        cancelledAppointments: items.filter((item) => item.estado === 'cancelada').length,
        doctors: Array.from(
          new Set(
            items
              .map((item) => this.buildDoctorName(item))
              .filter((value): value is string => Boolean(value))
          )
        ).sort((a, b) => a.localeCompare(b)),
        specialties: Array.from(
          new Set(
            items
              .map((item) => item.specialty_nombre?.trim())
              .filter((value): value is string => Boolean(value))
          )
        ).sort((a, b) => a.localeCompare(b)),
        appointments: orderedDesc,
        lastAppointment: firstItem,
        nextAppointment,
      };
    });

    if (this.estadoFiltro) {
      data = data.filter((record) =>
        record.appointments.some((item) => item.estado === this.estadoFiltro)
      );
    }

    if (this.especialidadFiltro) {
      data = data.filter((record) =>
        record.specialties.includes(this.especialidadFiltro)
      );
    }

    if (this.search.trim()) {
      const query = this.search.trim().toLowerCase();

      data = data.filter((record) => {
        const patientName = record.patientName.toLowerCase();
        const doctors = record.doctors.join(' ').toLowerCase();
        const specialties = record.specialties.join(' ').toLowerCase();

        return (
          patientName.includes(query) ||
          doctors.includes(query) ||
          specialties.includes(query)
        );
      });
    }

    return data.sort((a, b) => a.patientName.localeCompare(b.patientName));
  });

  readonly selectedRecord = computed<AdminPatientRecord | null>(() => {
    const currentKey = this.selectedPatientKey();
    if (!currentKey) return null;

    return this.records().find((item) => item.patientKey === currentKey) ?? null;
  });

  readonly specialtyOptions = computed<string[]>(() =>
    Array.from(
      new Set(
        this.appointments()
          .map((item) => item.specialty_nombre?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b))
  );

  readonly totalPacientes = computed<number>(() => this.records().length);

  readonly totalAtendidos = computed<number>(() =>
    this.records().filter((item) => item.attendedAppointments > 0).length
  );

  readonly totalPendientes = computed<number>(() =>
    this.records().filter((item) => item.pendingAppointments > 0).length
  );

  constructor() {
    effect(() => {
      const records = this.records();
      const selectedKey = this.selectedPatientKey();

      if (!records.length) {
        if (selectedKey !== null) {
          this.selectedPatientKey.set(null);
        }
        return;
      }

      const exists = selectedKey
        ? records.some((item) => item.patientKey === selectedKey)
        : false;

      if (!exists) {
        this.selectedPatientKey.set(records[0].patientKey);
      }
    });

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);

    this.appointmentsService
      .getAll({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.appointments.set(Array.isArray(data) ? data : []);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los expedientes.'
          );
        },
      });
  }

  clearFilters(): void {
    this.search = '';
    this.estadoFiltro = '';
    this.especialidadFiltro = '';
  }

  selectRecord(record: AdminPatientRecord): void {
    this.selectedPatientKey.set(record.patientKey);
  }

  formatTime(value: string | null | undefined): string {
    if (!value) return 'Sin hora';
    return value.slice(0, 5);
  }

  trackByRecord(_: number, item: AdminPatientRecord): string {
    return item.patientKey;
  }

  trackByAppointment(_: number, item: Appointment): number | string {
    return item.id;
  }

  private getAppointmentTime(appointment: Appointment): number {
    const fecha = appointment.fecha ?? '';
    const hora = appointment.hora_inicio ?? '00:00:00';
    return new Date(`${fecha}T${hora}`).getTime();
  }

  private buildPatientName(appointment: Appointment | null): string {
    if (!appointment) return 'Paciente sin nombre';

    const fullName = `${appointment.paciente_nombre ?? ''} ${appointment.paciente_apellidos ?? ''}`.trim();
    return fullName || 'Paciente sin nombre';
  }

  private buildDoctorName(appointment: Appointment): string {
    return `${appointment.doctor_nombre ?? ''} ${appointment.doctor_apellidos ?? ''}`.trim();
  }
}
