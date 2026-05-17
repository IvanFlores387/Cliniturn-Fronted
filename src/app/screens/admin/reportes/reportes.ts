import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  AppointmentsByDoctorItem,
  AppointmentsByMonthItem,
  AppointmentsBySpecialtyItem,
  ReportsSummary,
} from '../../../core/models/reports.model';

import { Appointment } from '../../../core/models/appointment.model';
import { Doctor } from '../../../core/models/doctor.model';
import { Consultorio } from '../../../core/models/consultorio.model';
import { Specialty } from '../../../core/models/specialty.model';

import { ReportsService } from '../../../services/reports.service';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class ReportesComponent {
  private readonly reportsService = inject(ReportsService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly doctorsService = inject(DoctorsService);
  private readonly consultoriosService = inject(ConsultoriosService);
  private readonly specialtiesService = inject(SpecialtiesService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);

  readonly summary = signal<ReportsSummary | null>(null);
  readonly bySpecialty = signal<AppointmentsBySpecialtyItem[]>([]);
  readonly byDoctor = signal<AppointmentsByDoctorItem[]>([]);
  readonly byMonth = signal<AppointmentsByMonthItem[]>([]);

  readonly appointments = signal<Appointment[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly consultorios = signal<Consultorio[]>([]);
  readonly specialties = signal<Specialty[]>([]);

  startDate = '';
  endDate = '';

  readonly maxMonthTotal = computed<number>(() =>
    Math.max(1, ...this.byMonth().map((item) => item.total))
  );

  readonly maxSpecialtyTotal = computed<number>(() =>
    Math.max(1, ...this.bySpecialty().map((item) => item.total))
  );

  readonly totalAppointments = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return Number(reportSummary.total_citas || 0);
    }

    return this.appointments().length;
  });

  readonly totalCompleted = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return Number(reportSummary.atendidas || 0);
    }

    return this.appointments().filter((item) => item.estado === 'atendida').length;
  });

  readonly totalCancelled = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return Number(reportSummary.canceladas || 0);
    }

    return this.appointments().filter((item) => item.estado === 'cancelada').length;
  });

  readonly confirmationRate = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return this.percentage(
        Number(reportSummary.confirmadas || 0) + Number(reportSummary.atendidas || 0),
        Number(reportSummary.total_citas || 0)
      );
    }

    const total = this.totalAppointments();

    if (!total) {
      return 0;
    }

    const confirmed = this.appointments().filter((item) =>
      ['confirmada', 'atendida'].includes(item.estado)
    ).length;

    return this.percentage(confirmed, total);
  });

  readonly cancellationRate = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return Number(reportSummary.porcentaje_cancelacion || 0);
    }

    return this.percentage(this.totalCancelled(), this.totalAppointments());
  });

  readonly activeDoctors = computed<number>(() =>
    this.doctors().filter((item) => Number(item.activo) === 1).length
  );

  readonly activeConsultorios = computed<number>(() =>
    this.consultorios().filter((item) => Number(item.activo) === 1).length
  );

  readonly specialtyDistribution = computed<SpecialtyReportItem[]>(() => {
    const reportSpecialties = this.bySpecialty();

    if (reportSpecialties.length > 0) {
      const total = reportSpecialties.reduce((sum, item) => sum + Number(item.total || 0), 0);

      return reportSpecialties
        .map((item) => ({
          name: item.specialty_nombre || 'Sin especialidad',
          count: Number(item.total || 0),
          percentage: this.percentage(Number(item.total || 0), total),
        }))
        .sort((a, b) => b.count - a.count);
    }

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
        percentage: total ? this.percentage(count, total) : 0,
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

        if (!itemDate) {
          return false;
        }

        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === day.getTime();
      }).length;

      result.push({ label, count });
    }

    return result;
  });

  readonly monthlyTrend = computed<MonthlyReportItem[]>(() => {
    const reportMonths = this.byMonth();

    if (reportMonths.length > 0) {
      return reportMonths.map((item) => ({
        label: this.monthLabel(item.month),
        count: Number(item.total || 0),
      }));
    }

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

        if (!itemDate) {
          return false;
        }

        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
      }).length;

      result.push({ label, count });
    }

    return result;
  });

  readonly statusSummary = computed<StatusReportItem[]>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      const total = Number(reportSummary.total_citas || 0);

      return [
        {
          label: 'Pendientes',
          count: Number(reportSummary.pendientes || 0),
          percentage: this.percentage(Number(reportSummary.pendientes || 0), total),
          cssClass: 'warning',
        },
        {
          label: 'Confirmadas',
          count: Number(reportSummary.confirmadas || 0),
          percentage: this.percentage(Number(reportSummary.confirmadas || 0), total),
          cssClass: 'success',
        },
        {
          label: 'Atendidas',
          count: Number(reportSummary.atendidas || 0),
          percentage: this.percentage(Number(reportSummary.atendidas || 0), total),
          cssClass: 'done',
        },
        {
          label: 'Canceladas',
          count: Number(reportSummary.canceladas || 0),
          percentage: this.percentage(Number(reportSummary.canceladas || 0), total),
          cssClass: 'danger',
        },
      ];
    }

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
        percentage: this.percentage(count, total),
        cssClass,
      };
    };

    return [
      build('Pendientes', 'pendiente', 'warning'),
      build('Confirmadas', 'confirmada', 'success'),
      build('Atendidas', 'atendida', 'done'),
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
    const reportSummary = this.summary();

    if (reportSummary?.especialidad_mas_solicitada?.nombre) {
      return reportSummary.especialidad_mas_solicitada.nombre;
    }

    return this.specialtyDistribution()[0]?.name || 'Sin datos';
  });

  readonly successRate = computed<number>(() => {
    const reportSummary = this.summary();

    if (reportSummary) {
      return this.percentage(
        Number(reportSummary.confirmadas || 0) + Number(reportSummary.atendidas || 0),
        Number(reportSummary.total_citas || 0)
      );
    }

    const total = this.totalAppointments();

    if (!total) {
      return 0;
    }

    const successful = this.appointments().filter((item) =>
      ['confirmada', 'atendida'].includes(item.estado)
    ).length;

    return this.percentage(successful, total);
  });

  readonly recommendations = computed<string[]>(() => {
    const tips: string[] = [];
    const reportSummary = this.summary();
    const cancellation = this.cancellationRate();
    const confirmation = this.confirmationRate();

    if (!this.totalAppointments()) {
      tips.push(
        'Aún no hay citas registradas en el periodo seleccionado. Prueba limpiando los filtros o generando nuevas citas.'
      );

      return tips;
    }

    if (cancellation >= 30) {
      tips.push(
        'La tasa de cancelación es alta. Conviene revisar causas frecuentes de cancelación y reforzar recordatorios a pacientes.'
      );
    }

    if (cancellation >= 20 && cancellation < 30) {
      tips.push(
        'La cancelación comienza a ser relevante. Se recomienda monitorear los motivos de cancelación.'
      );
    }

    if (confirmation >= 60) {
      tips.push(
        'El nivel de confirmación es positivo. Mantén el flujo actual de seguimiento de citas.'
      );
    }

    if (reportSummary?.pendientes && reportSummary.pendientes > reportSummary.confirmadas) {
      tips.push(
        'Hay más citas pendientes que confirmadas. Se recomienda validar la gestión de confirmaciones.'
      );
    }

    if (this.topSpecialty() !== 'Sin datos') {
      tips.push(`La especialidad con mayor demanda es ${this.topSpecialty()}.`);
    }

    if (this.activeDoctors() > 0 && this.specialties().length > 0) {
      if (this.activeDoctors() < this.specialties().length) {
        tips.push(
          'Revisa la cobertura de médicos activos por especialidad para evitar saturación.'
        );
      }
    }

    if (!tips.length) {
      tips.push(
        'El comportamiento general de las citas se mantiene estable para el periodo seleccionado.'
      );
    }

    return tips;
  });

  constructor() {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);

    const filters = {
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
    };

    forkJoin({
      summary: this.reportsService.getSummary(filters),
      bySpecialty: this.reportsService.getAppointmentsBySpecialty(filters),
      byDoctor: this.reportsService.getAppointmentsByDoctor(filters),
      byMonth: this.reportsService.getAppointmentsByMonth(filters),
      appointments: this.appointmentsService.getAll({}),
      doctors: this.doctorsService.getAdminList({}),
      consultorios: this.consultoriosService.getAll({}),
      specialties: this.specialtiesService.getAll(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({
          summary,
          bySpecialty,
          byDoctor,
          byMonth,
          appointments,
          doctors,
          consultorios,
          specialties,
        }) => {
          this.summary.set(summary);
          this.bySpecialty.set(this.extractArray<AppointmentsBySpecialtyItem>(bySpecialty));
          this.byDoctor.set(this.extractArray<AppointmentsByDoctorItem>(byDoctor));
          this.byMonth.set(this.extractArray<AppointmentsByMonthItem>(byMonth));

          this.appointments.set(this.extractArray<Appointment>(appointments));
          this.doctors.set(this.extractArray<Doctor>(doctors));
          this.consultorios.set(this.extractArray<Consultorio>(consultorios));
          this.specialties.set(this.extractArray<Specialty>(specialties));

          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);

          this.summary.set(null);
          this.bySpecialty.set([]);
          this.byDoctor.set([]);
          this.byMonth.set([]);

          this.notificationService.error(
            err?.error?.message || 'No se pudieron cargar los reportes.'
          );
        },
      });
  }

  loadData(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadReports();
  }

  percentage(value: number, max: number): number {
    const safeValue = Number(value || 0);
    const safeMax = Number(max || 0);

    if (!safeMax) {
      return 0;
    }

    return Math.min(100, Math.round((safeValue / safeMax) * 100));
  }

  monthLabel(month: string): string {
    if (!month) {
      return 'Sin mes';
    }

    const [year, monthNumber] = month.split('-').map(Number);

    if (!year || !monthNumber) {
      return month;
    }

    const date = new Date(year, monthNumber - 1, 1);

    return date.toLocaleDateString('es-MX', {
      month: 'short',
      year: 'numeric',
    });
  }

  doctorName(item: AppointmentsByDoctorItem): string {
    return `${item.doctor_nombre ?? ''} ${item.doctor_apellidos ?? ''}`.trim() || 'Médico';
  }

  trackBySpecialty(_index: number, item: AppointmentsBySpecialtyItem): number {
    return item.specialty_id;
  }

  trackByDoctor(_index: number, item: AppointmentsByDoctorItem): number {
    return item.doctor_id;
  }

  trackByMonth(_index: number, item: AppointmentsByMonthItem): string {
    return item.month;
  }

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
}
