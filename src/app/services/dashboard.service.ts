import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PatientDashboardData,
  DoctorDashboardData,
  AdminDashboardData,
} from '../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/dashboard`;

  getPatientDashboard(): Observable<PatientDashboardData> {
    return this.http
      .get<{ ok: boolean; data: PatientDashboardData }>(`${this.apiUrl}/patient`)
      .pipe(map((res) => res.data));
  }

  getDoctorDashboard(): Observable<DoctorDashboardData> {
    return this.http
      .get<{ ok: boolean; data: DoctorDashboardData }>(`${this.apiUrl}/doctor`)
      .pipe(map((res) => res.data));
  }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http
      .get<{ ok: boolean; data: AdminDashboardData }>(`${this.apiUrl}/admin`)
      .pipe(map((res) => res.data));
  }
}
