import { Component, DestroyRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { SpecialtiesService } from '../../../services/specialties.service';
import { DoctorsService } from '../../../services/doctors.service';
import { AppointmentsService } from '../../../services/appointments.service';

import { Specialty } from '../../../core/models/specialty.model';
import { Doctor } from '../../../core/models/doctor.model';
import { AvailabilitySlot } from '../../../core/models/availability-slot.model';

@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-cita.html',
  styleUrl: './nueva-cita.scss',
})
export class NuevaCita {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly specialtiesService = inject(SpecialtiesService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly appointmentsService = inject(AppointmentsService);

  readonly specialties = signal<Specialty[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly selectedSlot = signal<AvailabilitySlot | null>(null);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

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
        this.slots.set([]);
        this.selectedSlot.set(null);

        if (value) {
          this.loadDoctors(value);
        } else {
          this.doctors.set([]);
        }
      });

    this.form.get('doctor_id')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryLoadAvailability());

    this.form.get('fecha')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tryLoadAvailability());
  }

  private loadSpecialties(): void {
    this.specialtiesService.getAll().subscribe({
      next: data => this.specialties.set(data),
      error: () => this.errorMessage.set('No se pudieron cargar las especialidades.')
    });
  }

  private loadDoctors(specialtyId: number): void {
    this.doctorsService.getAll(specialtyId).subscribe({
      next: data => this.doctors.set(data),
      error: () => this.errorMessage.set('No se pudieron cargar los médicos.')
    });
  }

  private tryLoadAvailability(): void {
    const doctorId = this.form.value.doctor_id;
    const fecha = this.form.value.fecha;

    this.selectedSlot.set(null);
    this.slots.set([]);

    if (!doctorId || !fecha) return;

    this.loadingSlots.set(true);

    this.doctorsService.getAvailability(doctorId, fecha).subscribe({
      next: data => {
        this.slots.set(data);
        this.loadingSlots.set(false);
      },
      error: (err) => {
        this.loadingSlots.set(false);
        this.errorMessage.set(err?.error?.message || 'No se pudo cargar la disponibilidad.');
      }
    });
  }

  selectSlot(slot: AvailabilitySlot): void {
    this.selectedSlot.set(slot);
  }

  submit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.form.invalid || !this.selectedSlot()) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa todos los campos y selecciona un horario.');
      return;
    }

    const slot = this.selectedSlot()!;
    this.submitting.set(true);

    this.appointmentsService.create({
      doctor_id: this.form.value.doctor_id!,
      fecha: this.form.value.fecha!,
      hora_inicio: slot.hora_inicio,
      hora_fin: slot.hora_fin,
      motivo_consulta: this.form.value.motivo_consulta!.trim(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Cita agendada correctamente.');
        this.form.patchValue({ fecha: '', motivo_consulta: '' });
        this.slots.set([]);
        this.selectedSlot.set(null);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'No se pudo agendar la cita.');
      }
    });
  }
}
