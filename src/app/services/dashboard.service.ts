import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
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
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          const message = String(error?.error?.message ?? '').toLowerCase();

          if (message.includes('doctor_id asociado')) {
            return of({
              totals: {
                total_citas: 0,
                citas_hoy: 0,
                pendientes: 0,
                confirmadas: 0,
                atendidas: 0,
                canceladas: 0,
              },
              today_appointments: [],
              upcoming_appointments: [],
            } as DoctorDashboardData);
          }

          return throwError(() => error);
        })
      );
  }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http
      .get<{ ok: boolean; data: AdminDashboardData }>(`${this.apiUrl}/admin`)
      .pipe(map((res) => res.data));
  }
}
