import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SpecialtiesService } from '../../../services/specialties.service';
import { DoctorsService } from '../../../services/doctors.service';
import { AppointmentsService } from '../../../services/appointments.service';
import { NotificationService } from '../../../services/notification.service';

import { Specialty } from '../../../core/models/specialty.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AvailabilitySlot } from '../../../core/models/availability-slot.model';

import { ConfirmDialogComponent } from '../../../shared/components/appointment-status-chip/confirm-dialog/confirm-dialog';
import { AvailabilitySlotCardComponent } from '../../../shared/components/appointment-status-chip/availability-slot-card/availability-slot-card';

interface ConsultorioOption {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
    AvailabilitySlotCardComponent,
  ],
  templateUrl: './nueva-cita.html',
  styleUrl: './nueva-cita.scss',
})
export class NuevaCita {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly specialtiesService = inject(SpecialtiesService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly notificationService = inject(NotificationService);

  readonly specialties = signal<Specialty[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly filteredDoctors = signal<Doctor[]>([]);
  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly consultorios = signal<ConsultorioOption[]>([]);
  readonly loadingSlots = signal(false);
  readonly loadingDoctors = signal(false);
  readonly submitting = signal(false);
  readonly selectedSlot = signal<AvailabilitySlot | null>(null);
  readonly showConfirmDialog = signal(false);

  readonly today = this.getTodayDate();

  readonly form = this.fb.group({
    specialty_id: [null as number | null, Validators.required],
    consultorio_id: [null as number | null],
    doctor_id: [null as number | null, Validators.required],
    fecha: ['', Validators.required],
    motivo_consulta: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(255)],
    ],
  });

  readonly selectedDoctor = computed(() => {
    const doctorId = this.form.get('doctor_id')?.value;
    if (!doctorId) return null;
    return this.filteredDoctors().find((item) => Number(item.id) === Number(doctorId)) ?? null;
  });

  readonly selectedDoctorName = computed(() => {
    const doctor = this.selectedDoctor();
    if (!doctor) return '';
    return `${doctor.nombre} ${doctor.apellidos}`;
  });

  readonly selectedSpecialtyName = computed(() => {
    const specialtyId = this.form.get('specialty_id')?.value;
    if (!specialtyId) return '';
    return this.specialties().find((item) => Number(item.id) === Number(specialtyId))?.nombre ?? '';
  });

  readonly selectedConsultorioName = computed(() => {
    const doctor = this.selectedDoctor();
    if (!doctor) return '';
    return doctor.consultorio_nombre ?? '';
  });

  constructor() {
    this.loadSpecialties();

    this.form
      .get('specialty_id')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.form.patchValue(
          {
            consultorio_id: null,
            doctor_id: null,
            fecha: '',
          },
          { emitEvent: false }
        );

        this.doctors.set([]);
        this.filteredDoctors.set([]);
        this.consultorios.set([]);
        this.slots.set([]);
        this.selectedSlot.set(null);

        if (value !== null && value !== undefined) {
          this.loadDoctors(Number(value));
        }
      });

    this.form
      .get('consultorio_id')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((consultorioId) => {
        const allDoctors = this.doctors();

        if (!consultorioId) {
          this.filteredDoctors.set(allDoctors);
        } else {
          this.filteredDoctors.set(
            allDoctors.filter((item) => Number(item.consultorio_id) === Number(consultorioId))
          );
        }

        const selectedDoctorId = this.form.get('doctor_id')?.value;

        if (selectedDoctorId) {
          const exists = this.filteredDoctors().some(
            (item) => Number(item.id) === Number(selectedDoctorId)
          );

          if (!exists) {
            this.form.patchValue({ doctor_id: null }, { emitEvent: false });
            this.slots.set([]);
            this.selectedSlot.set(null);
          }
        }
      });

    this.form
      .get('doctor_id')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((doctorId) => {
        this.selectedSlot.set(null);
        this.slots.set([]);

        if (!doctorId) {
          return;
        }

        const doctor = this.filteredDoctors().find(
          (item) => Number(item.id) === Number(doctorId)
        );

        if (doctor) {
          this.form.patchValue(
            { consultorio_id: doctor.consultorio_id },
            { emitEvent: false }
          );
        }

        this.tryLoadAvailability();
      });

    this.form
      .get('fecha')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryLoadAvailability());
  }

  private getTodayDate(): string {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().split('T')[0];
  }

  private loadSpecialties(): void {
    this.specialtiesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.specialties.set(data),
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar las especialidades.'
          );
        },
      });
  }

  private loadDoctors(specialtyId: number): void {
    this.loadingDoctors.set(true);

    this.doctorsService
      .getAll(specialtyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loadingDoctors.set(false);
          this.doctors.set(data);
          this.filteredDoctors.set(data);
          this.consultorios.set(this.buildConsultoriosFromDoctors(data));
        },
        error: (err) => {
          this.loadingDoctors.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los médicos.'
          );
        },
      });
  }

  private buildConsultoriosFromDoctors(doctors: Doctor[]): ConsultorioOption[] {
    const map = new Map<number, ConsultorioOption>();

    doctors.forEach((doctor) => {
      if (!map.has(doctor.consultorio_id)) {
        map.set(doctor.consultorio_id, {
          id: doctor.consultorio_id,
          nombre: doctor.consultorio_nombre,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  private tryLoadAvailability(): void {
    const doctorId = this.form.get('doctor_id')?.value;
    const fecha = this.form.get('fecha')?.value;

    this.selectedSlot.set(null);
    this.slots.set([]);

    if (!doctorId || !fecha) {
      return;
    }

    this.loadingSlots.set(true);

    this.doctorsService
      .getAvailability(Number(doctorId), fecha)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.loadingSlots.set(false);
          this.slots.set(data);

          if (!data.length) {
            this.notificationService.info(
              'No hay horarios disponibles para la fecha seleccionada.'
            );
          }
        },
        error: (err) => {
          this.loadingSlots.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo cargar la disponibilidad.'
          );
        },
      });
  }

  selectSlot(slot: AvailabilitySlot): void {
    this.selectedSlot.set(slot);
  }

  openConfirmDialog(): void {
    if (this.form.invalid || !this.selectedSlot()) {
      this.form.markAllAsTouched();
      this.notificationService.error(
        'Completa todos los campos y selecciona un horario disponible.'
      );
      return;
    }

    this.showConfirmDialog.set(true);
  }

  closeConfirmDialog(): void {
    if (!this.submitting()) {
      this.showConfirmDialog.set(false);
    }
  }

  cancelForm(): void {
    this.form.reset({
      specialty_id: null,
      consultorio_id: null,
      doctor_id: null,
      fecha: '',
      motivo_consulta: '',
    });

    this.doctors.set([]);
    this.filteredDoctors.set([]);
    this.consultorios.set([]);
    this.slots.set([]);
    this.selectedSlot.set(null);
  }

  confirmCreateAppointment(): void {
    const slot = this.selectedSlot();
    const doctorId = this.form.get('doctor_id')?.value;
    const fecha = this.form.get('fecha')?.value;
    const motivoConsulta = this.form.get('motivo_consulta')?.value;

    if (!slot || !doctorId || !fecha || !motivoConsulta) {
      this.notificationService.error('Faltan datos para registrar la cita.');
      return;
    }

    this.submitting.set(true);

    this.appointmentsService
      .create({
        doctor_id: Number(doctorId),
        fecha,
        hora_inicio: slot.hora_inicio,
        hora_fin: slot.hora_fin,
        motivo_consulta: String(motivoConsulta).trim(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showConfirmDialog.set(false);
          this.notificationService.success('Cita agendada correctamente.');
          this.cancelForm();
        },
        error: (err) => {
          this.submitting.set(false);
          this.showConfirmDialog.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo agendar la cita.'
          );
        },
      });
  }

  trackBySlot(_: number, slot: AvailabilitySlot): string {
    return `${slot.hora_inicio}-${slot.hora_fin}`;
  }
}
