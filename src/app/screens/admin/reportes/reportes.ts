import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Appointment } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Consultorio } from '../../../core/models/consultorio.model';
import { Specialty } from '../../../core/models/specialty.model';

import { AppointmentsService } from '../../../services/appointments.service';
import { DoctorsService } from '../../../services/doctors.service';
import { ConsultoriosService } from '../../../services/consultorios.service';
import { SpecialtiesService } from '../../../services/specialties.service';
import { NotificationService } from '../../../services/notification.service';

interface SpecialtyReportItem {
  name: string;
  count: number;
  percentage: number;
}

interface WeeklyReportItem {
  label: string;
  count: number;
}

interface MonthlyReportItem {
  label: string;
  count: number;
}

interface StatusReportItem {
  label: string;
  count: number;
  percentage: number;
  cssClass: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class ReportesComponent {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly consultoriosService = inject(ConsultoriosService);
  private readonly specialtiesService = inject(SpecialtiesService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);

  readonly appointments = signal<Appointment[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly consultorios = signal<Consultorio[]>([]);
  readonly specialties = signal<Specialty[]>([]);

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    let completed = 0;
    const totalRequests = 4;

    const finish = (): void => {
      completed += 1;
      if (completed >= totalRequests) {
        this.loading.set(false);
      }
    };

    this.appointmentsService
      .getAll({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          this.appointments.set(this.extractArray<Appointment>(response));
          finish();
        },
        error: (err) => {
          this.appointments.set([]);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar las citas.'
          );
          finish();
        },
      });

    this.doctorsService
      .getAdminList({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          this.doctors.set(this.extractArray<Doctor>(response));
          finish();
        },
        error: (err) => {
          this.doctors.set([]);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los médicos.'
          );
          finish();
        },
      });

    this.consultoriosService
      .getAll({})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          this.consultorios.set(this.extractArray<Consultorio>(response));
          finish();
        },
        error: (err) => {
          this.consultorios.set([]);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los consultorios.'
          );
          finish();
        },
      });

    this.specialtiesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          this.specialties.set(this.extractArray<Specialty>(response));
          finish();
        },
        error: (err) => {
          this.specialties.set([]);
          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar las especialidades.'
          );
          finish();
        },
      });
  }

  private extractArray<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const candidate = response as Record<string, unknown>;

    const possibleKeys = [
      'data',
      'items',
      'results',
      'rows',
      'records',
      'list',
      'content',
    ];

    for (const key of possibleKeys) {
      const value = candidate[key];
      if (Array.isArray(value)) {
        return value as T[];
      }
    }

    return [];
  }

  private normalizeDate(value: string | null | undefined): Date | null {
    if (!value || typeof value !== 'string') {
      return null;
    }

    const parsed = new Date(value.includes('T') ? value : `${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  readonly totalAppointments = computed<number>(() => this.appointments().length);

  readonly totalCompleted = computed<number>(() =>
    this.appointments().filter((item) => item.estado === 'atendida').length
  );

  readonly totalCancelled = computed<number>(() =>
    this.appointments().filter((item) => item.estado === 'cancelada').length
  );

  readonly confirmationRate = computed<number>(() => {
    const total = this.totalAppointments();
    if (!total) return 0;

    const confirmed = this.appointments().filter((item) =>
      ['confirmada', 'atendida'].includes(item.estado)
    ).length;

    return Math.round((confirmed / total) * 100);
  });

  readonly cancellationRate = computed<number>(() => {
    const total = this.totalAppointments();
    if (!total) return 0;

    return Math.round((this.totalCancelled() / total) * 100);
  });

  readonly activeDoctors = computed<number>(() =>
    this.doctors().filter((item) => Number(item.activo) === 1).length
  );

  readonly activeConsultorios = computed<number>(() =>
    this.consultorios().filter((item) => Number(item.activo) === 1).length
  );

  readonly specialtyDistribution = computed<SpecialtyReportItem[]>(() => {
    const total = this.totalAppointments();
    const specialtyMap = new Map<string, number>();

    this.appointments().forEach((item) => {
      const key = item.specialty_nombre?.trim() || 'Sin especialidad';
      specialtyMap.set(key, (specialtyMap.get(key) || 0) + 1);
    });

    return Array.from(specialtyMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  });

  readonly weeklyTrend = computed<WeeklyReportItem[]>(() => {
    const now = new Date();
    const result: WeeklyReportItem[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(now.getDate() - i);

      const label = day.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
      });

      const count = this.appointments().filter((item) => {
        const itemDate = this.normalizeDate(item.fecha);
        if (!itemDate) return false;

        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === day.getTime();
      }).length;

      result.push({ label, count });
    }

    return result;
  });

  readonly monthlyTrend = computed<MonthlyReportItem[]>(() => {
    const now = new Date();
    const result: MonthlyReportItem[] = [];

    for (let i = 5; i >= 0; i--) {
      const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = current.getMonth();
      const year = current.getFullYear();

      const label = current.toLocaleDateString('es-MX', {
        month: 'short',
        year: 'numeric',
      });

      const count = this.appointments().filter((item) => {
        const itemDate = this.normalizeDate(item.fecha);
        if (!itemDate) return false;

        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
      }).length;

      result.push({ label, count });
    }

    return result;
  });

  readonly statusSummary = computed<StatusReportItem[]>(() => {
    const total = this.totalAppointments();

    const build = (
      label: string,
      estado: string,
      cssClass: string
    ): StatusReportItem => {
      const count = this.appointments().filter((item) => item.estado === estado).length;

      return {
        label,
        count,
        percentage: total ? Math.round((count / total) * 100) : 0,
        cssClass,
      };
    };

    return [
      build('Pendientes', 'pendiente', 'warning'),
      build('Confirmadas', 'confirmada', 'success'),
      build('Atendidas', 'atendida', 'info'),
      build('Canceladas', 'cancelada', 'danger'),
    ];
  });

  readonly maxWeeklyCount = computed<number>(() => {
    const counts = this.weeklyTrend().map((item) => item.count);
    return counts.length ? Math.max(...counts, 1) : 1;
  });

  readonly maxMonthlyCount = computed<number>(() => {
    const counts = this.monthlyTrend().map((item) => item.count);
    return counts.length ? Math.max(...counts, 1) : 1;
  });

  readonly topSpecialty = computed<string>(() => {
    return this.specialtyDistribution()[0]?.name || 'Sin datos';
  });

  readonly successRate = computed<number>(() => {
    const total = this.totalAppointments();
    if (!total) return 0;

    const successful = this.appointments().filter((item) =>
      ['confirmada', 'atendida'].includes(item.estado)
    ).length;

    return Math.round((successful / total) * 100);
  });

  readonly recommendations = computed<string[]>(() => {
    const tips: string[] = [];

    if (this.cancellationRate() >= 20) {
      tips.push(
        'La tasa de cancelación es alta. Conviene reforzar recordatorios y confirmaciones previas.'
      );
    }

    if (this.confirmationRate() >= 60) {
      tips.push(
        'El nivel de confirmación es positivo. Mantén el flujo actual de seguimiento de citas.'
      );
    }

    if (this.specialtyDistribution()[0]) {
      tips.push(
        `La especialidad con mayor demanda es ${this.specialtyDistribution()[0].name}.`
      );
    }

    if (this.activeDoctors() < this.specialties().length) {
      tips.push(
        'Revisa la cobertura de médicos activos por especialidad para evitar saturación.'
      );
    }

    if (!tips.length) {
      tips.push('Aún no hay suficientes datos para generar recomendaciones amplias.');
    }

    return tips;
  });

  getPieChartStyle(): string {
    const distribution = this.specialtyDistribution();

    if (!distribution.length) {
      return 'conic-gradient(#e5e7eb 0deg 360deg)';
    }

    const palette = ['#2746b3', '#3f7ce0', '#6097e6', '#86b2ef', '#adcaf6'];
    let start = 0;

    const parts = distribution.map((item, index) => {
      const size = (item.percentage / 100) * 360;
      const end = start + size;
      const color = palette[index % palette.length];
      const part = `${color} ${start}deg ${end}deg`;
      start = end;
      return part;
    });

    return `conic-gradient(${parts.join(', ')})`;
  }

  getWeeklyBarHeight(count: number): number {
    return Math.max(12, Math.round((count / this.maxWeeklyCount()) * 180));
  }

  getMonthlyBarHeight(count: number): number {
    return Math.max(12, Math.round((count / this.maxMonthlyCount()) * 180));
  }
}
