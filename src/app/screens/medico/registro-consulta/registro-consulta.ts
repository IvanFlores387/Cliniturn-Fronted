import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Appointment } from '../../../core/models/appointment.model';
import { AppointmentsService } from '../../../services/appointments.service';
import { ConsultationsService } from '../../../services/consultations.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-registro-consulta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro-consulta.html',
  styleUrl: './registro-consulta.scss',
})
export class RegistroConsultaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly consultationsService = inject(ConsultationsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly appointment = signal<Appointment | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly hasExistingConsultation = signal(false);

  readonly form = this.fb.nonNullable.group({
    diagnosis: ['', [Validators.required, Validators.minLength(3)]],
    treatment: ['', [Validators.required, Validators.minLength(3)]],
    observations: [''],
    general_indications: [''],
    peso: [''],
    talla: [''],
    presion_arterial: [''],
    temperatura: [''],
    frecuencia_cardiaca: [''],
    frecuencia_respiratoria: [''],
  });

  constructor() {
    this.loadAppointment();
  }

  loadAppointment(): void {
    const appointmentId = Number(this.route.snapshot.paramMap.get('appointmentId'));

    if (!appointmentId) {
      this.notificationService.error('No se encontró la cita seleccionada.');
      this.router.navigate(['/medico/mis-citas']);
      return;
    }

    this.loading.set(true);

    this.appointmentsService
      .getById(appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (appointment) => {
          this.appointment.set(appointment);
          this.loading.set(false);
          this.checkExistingConsultation(appointment.id);
        },
        error: (error) => {
          this.loading.set(false);
          this.notificationService.error(error?.error?.message || 'No se pudo cargar la cita.');
        },
      });
  }

  checkExistingConsultation(appointmentId: number): void {
    this.consultationsService
      .getByAppointmentId(appointmentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (consultation) => {
          this.hasExistingConsultation.set(true);
          this.form.patchValue({
            diagnosis: consultation.diagnosis ?? '',
            treatment: consultation.treatment ?? '',
            observations: consultation.observations ?? '',
            general_indications: consultation.general_indications ?? '',
            peso: consultation.vital_signs?.peso ?? '',
            talla: consultation.vital_signs?.talla ?? '',
            presion_arterial: consultation.vital_signs?.presion_arterial ?? '',
            temperatura: consultation.vital_signs?.temperatura ?? '',
            frecuencia_cardiaca: consultation.vital_signs?.frecuencia_cardiaca ?? '',
            frecuencia_respiratoria: consultation.vital_signs?.frecuencia_respiratoria ?? '',
          });
          this.form.disable();
        },
        error: () => {
          this.hasExistingConsultation.set(false);
        },
      });
  }

  save(): void {
    const appointment = this.appointment();
    if (!appointment) return;

    if (this.hasExistingConsultation()) {
      this.notificationService.error('Esta cita ya tiene una consulta registrada.');
      return;
    }

    if (!['confirmada', 'atendida'].includes(appointment.estado)) {
      this.notificationService.error('Solo puedes registrar consultas en citas confirmadas o atendidas.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Completa diagnóstico y tratamiento antes de guardar.');
      return;
    }

    const value = this.form.getRawValue();

    this.saving.set(true);
    this.consultationsService
      .create({
        appointment_id: appointment.id,
        diagnosis: value.diagnosis,
        treatment: value.treatment,
        observations: value.observations || null,
        general_indications: value.general_indications || null,
        vital_signs: {
          peso: value.peso,
          talla: value.talla,
          presion_arterial: value.presion_arterial,
          temperatura: value.temperatura,
          frecuencia_cardiaca: value.frecuencia_cardiaca,
          frecuencia_respiratoria: value.frecuencia_respiratoria,
        },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (consultation) => {
          this.saving.set(false);
          this.notificationService.success('Consulta guardada y cita marcada como atendida.');
          this.router.navigate(['/medico/historial-paciente', consultation.paciente_id]);
        },
        error: (error) => {
          this.saving.set(false);
          this.notificationService.error(error?.error?.message || 'No se pudo guardar la consulta.');
        },
      });
  }

  patientName(): string {
    const appointment = this.appointment();
    return `${appointment?.paciente_nombre ?? ''} ${appointment?.paciente_apellidos ?? ''}`.trim() || 'Paciente';
  }

  formatTime(value: string | null | undefined): string {
    return value ? value.slice(0, 5) : '--:--';
  }
}
