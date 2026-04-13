import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Doctor } from '../../../core/models/doctor.model';
import {
  DoctorSchedule,
  DoctorScheduleResponse,
} from '../../../core/models/doctor-schedule.model';
import { DoctorsService, SaveDoctorSchedulePayload } from '../../../services/doctors.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-horarios-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './horarios-medicos.html',
  styleUrl: './horarios-medicos.scss',
})
export class HorariosMedicosComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doctorsService = inject(DoctorsService);
  private readonly notificationService = inject(NotificationService);

  readonly doctors = signal<Doctor[]>([]);
  readonly schedules = signal<DoctorSchedule[]>([]);
  readonly loadingDoctors = signal(true);
  readonly loadingSchedules = signal(false);
  readonly submitting = signal(false);

  readonly selectedDoctorId = signal<number | null>(null);
  readonly selectedDoctorName = signal('');

  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly selectedScheduleId = signal<number | null>(null);

  searchDoctor = '';

  readonly form = this.fb.group({
    dia_semana: [null as number | null, [Validators.required]],
    hora_inicio: ['', [Validators.required]],
    hora_fin: ['', [Validators.required]],
    activo: [1, [Validators.required]],
  });

  readonly filteredDoctors = computed(() => {
    const query = this.searchDoctor.trim().toLowerCase();

    if (!query) {
      return this.doctors();
    }

    return this.doctors().filter((item) => {
      const fullName = `${item.nombre} ${item.apellidos}`.toLowerCase();
      const specialty = `${item.specialty_nombre ?? ''}`.toLowerCase();
      const consultorio = `${item.consultorio_nombre ?? ''}`.toLowerCase();
      const email = `${item.email ?? ''}`.toLowerCase();

      return (
        fullName.includes(query) ||
        specialty.includes(query) ||
        consultorio.includes(query) ||
        email.includes(query)
      );
    });
  });

  readonly groupedSchedules = computed(() => {
    const map = new Map<number, DoctorSchedule[]>();

    this.schedules().forEach((schedule) => {
      if (!map.has(schedule.dia_semana)) {
        map.set(schedule.dia_semana, []);
      }
      map.get(schedule.dia_semana)?.push(schedule);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([dia, items]) => ({
        dia,
        nombreDia: this.getDayLabel(dia),
        items: [...items].sort((x, y) => x.hora_inicio.localeCompare(y.hora_inicio)),
      }));
  });

  readonly days = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  constructor() {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loadingDoctors.set(true);

    this.doctorsService
      .getAdminList({ activo: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.doctors.set(data);
          this.loadingDoctors.set(false);
        },
        error: (err) => {
          this.loadingDoctors.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los médicos.'
          );
        },
      });
  }

  selectDoctor(item: Doctor): void {
    this.selectedDoctorId.set(item.id);
    this.selectedDoctorName.set(`${item.nombre} ${item.apellidos}`);
    this.loadSchedules(item.id);
  }

  loadSchedules(doctorId: number): void {
    this.loadingSchedules.set(true);

    this.doctorsService
      .getSchedulesByDoctor(doctorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: DoctorScheduleResponse) => {
          this.schedules.set(response.schedules);
          this.loadingSchedules.set(false);

          const doctorName = `${response.doctor.nombre} ${response.doctor.apellidos}`;
          this.selectedDoctorName.set(doctorName);
        },
        error: (err) => {
          this.loadingSchedules.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los horarios.'
          );
        },
      });
  }

  openCreateModal(): void {
    if (!this.selectedDoctorId()) {
      this.notificationService.error('Primero selecciona un médico.');
      return;
    }

    this.isEditing.set(false);
    this.selectedScheduleId.set(null);

    this.form.reset({
      dia_semana: null,
      hora_inicio: '',
      hora_fin: '',
      activo: 1,
    });

    this.modalVisible.set(true);
  }

  openEditModal(item: DoctorSchedule): void {
    this.isEditing.set(true);
    this.selectedScheduleId.set(item.id);

    this.form.reset({
      dia_semana: item.dia_semana,
      hora_inicio: this.normalizeTimeForInput(item.hora_inicio),
      hora_fin: this.normalizeTimeForInput(item.hora_fin),
      activo: item.activo,
    });

    this.modalVisible.set(true);
  }

  closeModal(): void {
    if (this.submitting()) return;
    this.modalVisible.set(false);
  }

  save(): void {
    const doctorId = this.selectedDoctorId();

    if (!doctorId) {
      this.notificationService.error('No hay médico seleccionado.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Completa correctamente los campos del formulario.');
      return;
    }

    const payload: SaveDoctorSchedulePayload = {
      dia_semana: Number(this.form.value.dia_semana),
      hora_inicio: String(this.form.value.hora_inicio),
      hora_fin: String(this.form.value.hora_fin),
      activo: Number(this.form.value.activo ?? 1),
    };

    this.submitting.set(true);

    const request$ =
      this.isEditing() && this.selectedScheduleId()
        ? this.doctorsService.updateSchedule(doctorId, this.selectedScheduleId()!, payload)
        : this.doctorsService.createSchedule(doctorId, payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.modalVisible.set(false);
          this.notificationService.success(
            this.isEditing()
              ? 'Horario actualizado correctamente.'
              : 'Horario creado correctamente.'
          );
          this.loadSchedules(doctorId);
        },
        error: (err) => {
          this.submitting.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo guardar el horario.'
          );
        },
      });
  }

  deleteSchedule(item: DoctorSchedule): void {
    const doctorId = this.selectedDoctorId();

    if (!doctorId) {
      this.notificationService.error('No hay médico seleccionado.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Deseas eliminar el horario ${this.formatTime(item.hora_inicio)} - ${this.formatTime(item.hora_fin)} del ${this.getDayLabel(item.dia_semana)}?`
    );

    if (!confirmDelete) return;

    this.doctorsService
      .deleteSchedule(doctorId, item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Horario eliminado correctamente.');
          this.loadSchedules(doctorId);
        },
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudo eliminar el horario.'
          );
        },
      });
  }

  getDayLabel(day: number): string {
    return (
      this.days.find((item) => item.value === Number(day))?.label || 'Desconocido'
    );
  }

  normalizeTimeForInput(value: string): string {
    return value?.slice(0, 5) || '';
  }

  formatTime(value: string): string {
    return value?.slice(0, 5) || value;
  }

  trackByDoctorId(_: number, item: Doctor): number {
    return item.id;
  }

  trackByScheduleId(_: number, item: DoctorSchedule): number {
    return item.id;
  }
}
