import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Doctor } from '../../../core/models/doctor.model';
import { Specialty } from '../../../core/models/specialty.model';
import { Consultorio } from '../../../core/models/consultorio.model';

import {
  DoctorsService,
  SaveDoctorPayload,
} from '../../../services/doctors.service';
import { SpecialtiesService } from '../../../services/specialties.service';
import { ConsultoriosService } from '../../../services/consultorios.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gestion-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-medicos.html',
  styleUrl: './gestion-medicos.scss',
})
export class GestionMedicos {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doctorsService = inject(DoctorsService);
  private readonly specialtiesService = inject(SpecialtiesService);
  private readonly consultoriosService = inject(ConsultoriosService);
  private readonly notificationService = inject(NotificationService);

  readonly doctors = signal<Doctor[]>([]);
  readonly specialties = signal<Specialty[]>([]);
  readonly consultorios = signal<Consultorio[]>([]);

  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly selectedDoctorId = signal<number | null>(null);

  readonly activeDoctorsCount = computed(() =>
    this.doctors().filter((d) => Number(d.activo) === 1).length
  );

  readonly inactiveDoctorsCount = computed(() =>
    this.doctors().filter((d) => Number(d.activo) === 0).length
  );

  search = '';
  specialtyFiltro: number | '' = '';
  consultorioFiltro: number | '' = '';
  activoFiltro: number | '' = '';

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
    password: [''],
    specialty_id: [null as number | null, [Validators.required]],
    consultorio_id: [null as number | null, [Validators.required]],
    duracion_cita_minutos: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
    activo: [1, [Validators.required]],
  });

  constructor() {
    this.loadCatalogs();
    this.loadDoctors();
  }

  private extractArray<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const candidate = response as Record<string, unknown>;
    const possibleKeys = ['data', 'items', 'results', 'rows', 'records', 'list', 'content'];

    for (const key of possibleKeys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }

    return [];
  }

  private loadCatalogs(): void {
    this.specialtiesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.specialties.set(this.extractArray<Specialty>(data));
        },
        error: () => {
          this.notificationService.error('No se pudieron cargar las especialidades.');
        },
      });

    this.consultoriosService
      .getAll({ activo: 1 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.consultorios.set(this.extractArray<Consultorio>(data));
        },
        error: () => {
          this.notificationService.error('No se pudieron cargar los consultorios.');
        },
      });
  }

  loadDoctors(): void {
    this.loading.set(true);

    this.doctorsService
      .getAdminList({
        search: this.search,
        specialty_id: this.specialtyFiltro,
        consultorio_id: this.consultorioFiltro,
        activo: this.activoFiltro,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          this.doctors.set(this.extractArray<Doctor>(response));
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los médicos.'
          );
        },
      });
  }

  applyFilters(): void {
    this.loadDoctors();
  }

  clearFilters(): void {
    this.search = '';
    this.specialtyFiltro = '';
    this.consultorioFiltro = '';
    this.activoFiltro = '';
    this.loadDoctors();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedDoctorId.set(null);

    this.form.reset({
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      specialty_id: null,
      consultorio_id: null,
      duracion_cita_minutos: 30,
      activo: 1,
    });

    this.form.get('password')?.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(50),
    ]);
    this.form.get('password')?.updateValueAndValidity();

    this.modalVisible.set(true);
  }

  openEditModal(item: Doctor): void {
    this.isEditing.set(true);
    this.selectedDoctorId.set(item.id);

    this.form.reset({
      nombre: item.nombre,
      apellidos: item.apellidos,
      email: item.email || '',
      password: '',
      specialty_id: item.specialty_id,
      consultorio_id: item.consultorio_id,
      duracion_cita_minutos: item.duracion_cita_minutos,
      activo: Number(item.activo),
    });

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    this.modalVisible.set(true);
  }

  closeModal(): void {
    if (this.submitting()) return;
    this.modalVisible.set(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.error('Completa correctamente los campos del formulario.');
      return;
    }

    const payload: SaveDoctorPayload = {
      nombre: this.form.value.nombre?.trim() || '',
      apellidos: this.form.value.apellidos?.trim() || '',
      email: this.form.value.email?.trim() || '',
      specialty_id: Number(this.form.value.specialty_id),
      consultorio_id: Number(this.form.value.consultorio_id),
      duracion_cita_minutos: Number(this.form.value.duracion_cita_minutos),
      activo: Number(this.form.value.activo ?? 1),
    };

    if (!this.isEditing()) {
      payload.password = this.form.value.password?.trim() || '';
    }

    this.submitting.set(true);

    const request$ =
      this.isEditing() && this.selectedDoctorId()
        ? this.doctorsService.updateAdmin(this.selectedDoctorId()!, payload)
        : this.doctorsService.createAdmin(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.modalVisible.set(false);
          this.notificationService.success(
            this.isEditing()
              ? 'Médico actualizado correctamente.'
              : 'Médico creado correctamente.'
          );
          this.loadDoctors();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo guardar el médico.'
          );
        },
      });
  }

  toggleStatus(item: Doctor): void {
    const nuevoEstado = Number(item.activo) === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';

    const confirmar = window.confirm(
      `¿Deseas ${accion} al médico "${item.nombre} ${item.apellidos}"?`
    );

    if (!confirmar) return;

    this.doctorsService
      .toggleAdminStatus(item.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(
            nuevoEstado === 1
              ? 'Médico activado correctamente.'
              : 'Médico desactivado correctamente.'
          );
          this.loadDoctors();
        },
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudo cambiar el estado del médico.'
          );
        },
      });
  }

  trackById(_: number, item: Doctor): number {
    return item.id;
  }
}
