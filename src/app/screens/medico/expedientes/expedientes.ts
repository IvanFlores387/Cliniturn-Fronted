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
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MedicalRecord } from '../../../core/models/clinical-record.model';
import { RecordsService } from '../../../services/records.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './expedientes.html',
  styleUrl: './expedientes.scss',
})
export class ExpedientesComponent {
  private readonly recordsService = inject(RecordsService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);
  readonly records = signal<MedicalRecord[]>([]);
  readonly selectedRecordId = signal<number | null>(null);

  search = '';

  readonly filteredRecords = computed<MedicalRecord[]>(() => {
    const query = this.search.trim().toLowerCase();

    if (!query) {
      return this.records();
    }

    return this.records().filter((record) => {
      const patient = this.patientName(record).toLowerCase();
      const matricula = String(record.paciente_matricula ?? '').toLowerCase();
      const pacienteId = String(record.paciente_id ?? '').toLowerCase();

      const lastDoctor = `${record.last_doctor_nombre ?? ''} ${record.last_doctor_apellidos ?? ''}`
        .trim()
        .toLowerCase();

      const diagnosis = String(record.last_diagnosis ?? '').toLowerCase();
      const treatment = String(record.last_treatment ?? '').toLowerCase();

      return (
        patient.includes(query) ||
        matricula.includes(query) ||
        pacienteId.includes(query) ||
        lastDoctor.includes(query) ||
        diagnosis.includes(query) ||
        treatment.includes(query)
      );
    });
  });

  readonly selectedRecord = computed<MedicalRecord | null>(() => {
    const id = this.selectedRecordId();

    if (id === null) {
      return null;
    }

    return this.filteredRecords().find((record) => record.id === id) ?? null;
  });

  readonly totalPacientes = computed<number>(() => this.records().length);

  readonly totalConsultas = computed<number>(() =>
    this.records().reduce(
      (sum, record) => sum + Number(record.total_consultations ?? 0),
      0
    )
  );

  constructor() {
    effect(() => {
      const records = this.filteredRecords();
      const selectedId = this.selectedRecordId();

      if (!records.length) {
        if (selectedId !== null) {
          this.selectedRecordId.set(null);
        }

        return;
      }

      const selectedExists = selectedId
        ? records.some((record) => record.id === selectedId)
        : false;

      if (!selectedExists) {
        this.selectedRecordId.set(records[0].id);
      }
    });

    this.loadRecords();
  }

  loadRecords(): void {
    this.loading.set(true);

    this.recordsService
      .getAll({ search: this.search })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.records.set(Array.isArray(data) ? data : []);
          this.loading.set(false);
        },
        error: (error) => {
          this.records.set([]);
          this.selectedRecordId.set(null);
          this.loading.set(false);

          this.notificationService.error(
            error?.error?.message || 'No se pudieron cargar los expedientes del médico.'
          );
        },
      });
  }

  selectRecord(record: MedicalRecord): void {
    this.selectedRecordId.set(record.id);
  }

  clearFilters(): void {
    this.search = '';
    this.loadRecords();
  }

  patientName(record: MedicalRecord | null | undefined): string {
    if (!record) {
      return 'Paciente sin nombre';
    }

    return `${record.paciente_nombre ?? ''} ${record.paciente_apellidos ?? ''}`.trim()
      || 'Paciente sin nombre';
  }

  doctorName(record: MedicalRecord | null | undefined): string {
    if (!record) {
      return 'Sin médico';
    }

    return `${record.last_doctor_nombre ?? ''} ${record.last_doctor_apellidos ?? ''}`.trim()
      || 'Sin médico';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) {
      return 'Sin registro';
    }

    return new Date(value).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  trackByRecordId(_index: number, item: MedicalRecord): number {
    return item.id;
  }
}
