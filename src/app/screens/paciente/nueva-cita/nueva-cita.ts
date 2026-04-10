import { Component, DestroyRef, inject, signal } from '@angular/core';
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
  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly selectedSlot = signal<AvailabilitySlot | null>(null);
  readonly showConfirmDialog = signal(false);

  readonly form = this.fb.group({
    specialty_id: [null as number | null, Validators.required],
    doctor_id: [null as number | null, Validators.required],
    fecha: ['', Validators.required],
    motivo_consulta: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
  });

  constructor() {
    this.loadSpecialties();

    this.form.get('specialty_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        this.form.patchValue({ doctor_id: null });
        this.doctors.set([]);
        this.slots.set([]);
        this.selectedSlot.set(null);

        if (value) {
          this.loadDoctors(value);
        }
      });

    this.form.get('doctor_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryLoadAvailability());

    this.form.get('fecha')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryLoadAvailability());
  }

  get selectedDoctorName(): string {
    const doctorId = this.form.value.doctor_id;
    const doctor = this.doctors().find(item => item.id === doctorId);

    if (!doctor) return '';
    return `${doctor.nombre} ${doctor.apellidos}`;
  }

  private loadSpecialties(): void {
    this.specialtiesService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.specialties.set(data),
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar las especialidades.'
          );
        }
      });
  }

  private loadDoctors(specialtyId: number): void {
    this.doctorsService.getAll(specialtyId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.doctors.set(data),
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los médicos.'
          );
        }
      });
  }

  private tryLoadAvailability(): void {
    const doctorId = this.form.value.doctor_id;
    const fecha = this.form.value.fecha;

    this.selectedSlot.set(null);
    this.slots.set([]);

    if (!doctorId || !fecha) return;

    this.loadingSlots.set(true);

    this.doctorsService.getAvailability(doctorId, fecha)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.slots.set(data);
          this.loadingSlots.set(false);

          if (!data.length) {
            this.notificationService.info('No hay horarios disponibles para la fecha seleccionada.');
          }
        },
        error: (err) => {
          this.loadingSlots.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo cargar la disponibilidad.'
          );
        }
      });
  }

  selectSlot(slot: AvailabilitySlot): void {
    this.selectedSlot.set(slot);
  }

  openConfirmDialog(): void {
    if (this.form.invalid || !this.selectedSlot()) {
      this.form.markAllAsTouched();
      this.notificationService.error('Completa todos los campos y selecciona un horario.');
      return;
    }

    this.showConfirmDialog.set(true);
  }

  closeConfirmDialog(): void {
    if (!this.submitting()) {
      this.showConfirmDialog.set(false);
    }
  }

  confirmCreateAppointment(): void {
    const slot = this.selectedSlot();
    if (!slot) return;

    this.submitting.set(true);

    this.appointmentsService.create({
      doctor_id: this.form.value.doctor_id!,
      fecha: this.form.value.fecha!,
      hora_inicio: slot.hora_inicio,
      hora_fin: slot.hora_fin,
      motivo_consulta: this.form.value.motivo_consulta!.trim(),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.submitting.set(false);
        this.showConfirmDialog.set(false);
        this.notificationService.success('Cita agendada correctamente.');

        this.form.reset({
          specialty_id: null,
          doctor_id: null,
          fecha: '',
          motivo_consulta: '',
        });

        this.doctors.set([]);
        this.slots.set([]);
        this.selectedSlot.set(null);
      },
      error: (err) => {
        this.submitting.set(false);
        this.showConfirmDialog.set(false);
        this.notificationService.error(
          err?.error?.message || 'No se pudo agendar la cita.'
        );
      }
    });
  }

  trackBySlot(_: number, slot: AvailabilitySlot): string {
    return `${slot.hora_inicio}-${slot.hora_fin}`;
  }
}
