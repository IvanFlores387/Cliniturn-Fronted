import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Consultation } from '../../../core/models/clinical-record.model';
import { MedicalHistory } from '../../../core/models/history.model';
import { HistoryService } from '../../../services/history.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-expediente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './expediente.html',
  styleUrl: './expediente.scss',
})
export class Expediente {
  private readonly historyService = inject(HistoryService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly history = signal<MedicalHistory | null>(null);

  constructor() {
    this.loadMyRecord();
  }

  loadMyRecord(): void {
    this.loading.set(true);
    this.historyService
      .getMyHistory()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.history.set(history);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
          this.history.set(null);
          this.notificationService.error(error?.error?.message || 'Aún no tienes historial clínico registrado.');
        },
      });
  }

  patientName(): string {
    const patient = this.history()?.patient;
    return `${patient?.paciente_nombre ?? ''} ${patient?.paciente_apellidos ?? ''}`.trim() || 'Paciente';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'Sin fecha';
    return new Date(value).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  vitalSignsText(item: Consultation): string {
    const v = item.vital_signs;
    if (!v) return 'Sin signos vitales capturados';
    return [
      v.peso ? `Peso: ${v.peso}` : '',
      v.talla ? `Talla: ${v.talla}` : '',
      v.presion_arterial ? `P.A.: ${v.presion_arterial}` : '',
      v.temperatura ? `Temp.: ${v.temperatura}` : '',
      v.frecuencia_cardiaca ? `F.C.: ${v.frecuencia_cardiaca}` : '',
      v.frecuencia_respiratoria ? `F.R.: ${v.frecuencia_respiratoria}` : '',
    ].filter(Boolean).join(' · ') || 'Sin signos vitales capturados';
  }

  trackByConsultationId(_index: number, item: Consultation): number {
    return item.id;
  }
}
