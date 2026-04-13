import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Consultorio } from '../../../core/models/consultorio.model';
import {
  ConsultoriosService,
  SaveConsultorioPayload,
} from '../../../services/consultorios.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gestion-consultorios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-consultorios.html',
  styleUrl: './gestion-consultorios.scss',
})
export class GestionConsultorios {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly consultoriosService = inject(ConsultoriosService);
  private readonly notificationService = inject(NotificationService);

  readonly consultorios = signal<Consultorio[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly selectedConsultorioId = signal<number | null>(null);

  search = '';
  activoFiltro: number | '' = '';

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    ubicacion: ['', [Validators.maxLength(150)]],
    descripcion: ['', [Validators.maxLength(255)]],
    activo: [1, [Validators.required]],
  });

  constructor() {
    this.loadConsultorios();
  }

  loadConsultorios(): void {
    this.loading.set(true);

    this.consultoriosService
      .getAll({
        search: this.search,
        activo: this.activoFiltro,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.consultorios.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los consultorios.'
          );
        },
      });
  }

  applyFilters(): void {
    this.loadConsultorios();
  }

  clearFilters(): void {
    this.search = '';
    this.activoFiltro = '';
    this.loadConsultorios();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.selectedConsultorioId.set(null);
    this.form.reset({
      nombre: '',
      ubicacion: '',
      descripcion: '',
      activo: 1,
    });
    this.modalVisible.set(true);
  }

  openEditModal(item: Consultorio): void {
    this.isEditing.set(true);
    this.selectedConsultorioId.set(item.id);

    this.form.reset({
      nombre: item.nombre,
      ubicacion: item.ubicacion || '',
      descripcion: item.descripcion || '',
      activo: item.activo,
    });

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

    const payload: SaveConsultorioPayload = {
      nombre: this.form.value.nombre?.trim() || '',
      ubicacion: this.form.value.ubicacion?.trim() || null,
      descripcion: this.form.value.descripcion?.trim() || null,
      activo: Number(this.form.value.activo ?? 1),
    };

    this.submitting.set(true);

    const request$ = this.isEditing() && this.selectedConsultorioId()
      ? this.consultoriosService.update(this.selectedConsultorioId()!, payload)
      : this.consultoriosService.create(payload);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.modalVisible.set(false);
          this.notificationService.success(
            this.isEditing()
              ? 'Consultorio actualizado correctamente.'
              : 'Consultorio creado correctamente.'
          );
          this.loadConsultorios();
        },
        error: (err) => {
          this.submitting.set(false);
          this.notificationService.error(
            err?.error?.message || 'No se pudo guardar el consultorio.'
          );
        },
      });
  }

  toggleStatus(item: Consultorio): void {
    const nuevoEstado = item.activo === 1 ? 0 : 1;
    const accion = nuevoEstado === 1 ? 'activar' : 'desactivar';

    const confirmar = window.confirm(
      `¿Deseas ${accion} el consultorio "${item.nombre}"?`
    );

    if (!confirmar) return;

    this.consultoriosService
      .toggleStatus(item.id, nuevoEstado)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(
            nuevoEstado === 1
              ? 'Consultorio activado correctamente.'
              : 'Consultorio desactivado correctamente.'
          );
          this.loadConsultorios();
        },
        error: (err) => {
          this.notificationService.error(
            err?.error?.message || 'No se pudo cambiar el estado del consultorio.'
          );
        },
      });
  }

  trackById(_: number, item: Consultorio): number {
    return item.id;
  }
}
