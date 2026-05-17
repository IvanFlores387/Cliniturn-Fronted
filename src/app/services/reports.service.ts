import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  AppointmentsByDoctorItem,
  AppointmentsByMonthItem,
  AppointmentsBySpecialtyItem,
  CancellationRate,
  ReportsFilters,
  ReportsSummary,
} from '../core/models/reports.model';

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/reports`;

  getSummary(filters: ReportsFilters = {}): Observable<ReportsSummary> {
    return this.http
      .get<ApiResponse<ReportsSummary>>(`${this.apiUrl}/summary`, {
        params: this.buildParams(filters),
      })
      .pipe(map((res) => res.data));
  }

  getAppointmentsBySpecialty(filters: ReportsFilters = {}): Observable<AppointmentsBySpecialtyItem[]> {
    return this.http
      .get<ApiResponse<AppointmentsBySpecialtyItem[]>>(`${this.apiUrl}/appointments-by-specialty`, {
        params: this.buildParams(filters),
      })
      .pipe(map((res) => res.data));
  }

  getAppointmentsByDoctor(filters: ReportsFilters = {}): Observable<AppointmentsByDoctorItem[]> {
    return this.http
      .get<ApiResponse<AppointmentsByDoctorItem[]>>(`${this.apiUrl}/appointments-by-doctor`, {
        params: this.buildParams(filters),
      })
      .pipe(map((res) => res.data));
  }

  getAppointmentsByMonth(filters: ReportsFilters = {}): Observable<AppointmentsByMonthItem[]> {
    return this.http
      .get<ApiResponse<AppointmentsByMonthItem[]>>(`${this.apiUrl}/appointments-by-month`, {
        params: this.buildParams(filters),
      })
      .pipe(map((res) => res.data));
  }

  getCancellationRate(filters: ReportsFilters = {}): Observable<CancellationRate> {
    return this.http
      .get<ApiResponse<CancellationRate>>(`${this.apiUrl}/cancellation-rate`, {
        params: this.buildParams(filters),
      })
      .pipe(map((res) => res.data));
  }

  private buildParams(filters: ReportsFilters): HttpParams {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return params;
  }
}
