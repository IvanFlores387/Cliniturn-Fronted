import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Doctor } from '../core/models/doctor.model';
import { AvailabilitySlot } from '../core/models/availability-slot.model';
import {
  DoctorSchedule,
  DoctorScheduleResponse,
} from '../core/models/doctor-schedule.model';

export interface AdminDoctorFilters {
  search?: string;
  specialty_id?: number | '';
  consultorio_id?: number | '';
  activo?: number | '';
}

export interface SaveDoctorPayload {
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  specialty_id: number;
  consultorio_id: number;
  duracion_cita_minutos: number;
  activo?: number;
}

export interface SaveDoctorSchedulePayload {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo?: number;
}

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly http = inject(HttpClient);
  private readonly publicApiUrl = `${environment.apiUrl}/api/doctors`;
  private readonly adminApiUrl = `${environment.apiUrl}/api/admin/doctors`;

  // =========================
  // PARTE PÚBLICA
  // =========================
  getAll(specialtyId?: number): Observable<Doctor[]> {
    let params = new HttpParams();

    if (specialtyId) {
      params = params.set('specialtyId', String(specialtyId));
    }

    return this.http
      .get<{ ok: boolean; data: Doctor[] }>(this.publicApiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getAvailability(doctorId: number, date: string): Observable<AvailabilitySlot[]> {
    return this.http
      .get<{ ok: boolean; data: AvailabilitySlot[] }>(
        `${this.publicApiUrl}/${doctorId}/availability`,
        {
          params: { date },
        }
      )
      .pipe(map((res) => res.data));
  }

  // =========================
  // PARTE ADMIN
  // =========================
  getAdminList(filters?: AdminDoctorFilters): Observable<Doctor[]> {
    let params = new HttpParams();

    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters?.specialty_id !== '' && filters?.specialty_id !== undefined) {
      params = params.set('specialty_id', String(filters.specialty_id));
    }

    if (filters?.consultorio_id !== '' && filters?.consultorio_id !== undefined) {
      params = params.set('consultorio_id', String(filters.consultorio_id));
    }

    if (filters?.activo !== '' && filters?.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }

    return this.http
      .get<{ ok: boolean; data: Doctor[] }>(this.adminApiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getAdminById(id: number): Observable<Doctor> {
    return this.http
      .get<{ ok: boolean; data: Doctor }>(`${this.adminApiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createAdmin(payload: SaveDoctorPayload): Observable<Doctor> {
    return this.http
      .post<{ ok: boolean; data: Doctor }>(this.adminApiUrl, payload)
      .pipe(map((res) => res.data));
  }

  updateAdmin(id: number, payload: SaveDoctorPayload): Observable<Doctor> {
    return this.http
      .put<{ ok: boolean; data: Doctor }>(`${this.adminApiUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  toggleAdminStatus(id: number, activo: number): Observable<Doctor> {
    return this.http
      .patch<{ ok: boolean; data: Doctor }>(`${this.adminApiUrl}/${id}/toggle`, { activo })
      .pipe(map((res) => res.data));
  }

  // =========================
  // HORARIOS ADMIN
  // =========================
  getSchedulesByDoctor(doctorId: number): Observable<DoctorScheduleResponse> {
    return this.http
      .get<{ ok: boolean; data: DoctorScheduleResponse }>(
        `${this.adminApiUrl}/${doctorId}/schedules`
      )
      .pipe(map((res) => res.data));
  }

  createSchedule(
    doctorId: number,
    payload: SaveDoctorSchedulePayload
  ): Observable<DoctorSchedule> {
    return this.http
      .post<{ ok: boolean; data: DoctorSchedule }>(
        `${this.adminApiUrl}/${doctorId}/schedules`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  updateSchedule(
    doctorId: number,
    scheduleId: number,
    payload: SaveDoctorSchedulePayload
  ): Observable<DoctorSchedule> {
    return this.http
      .put<{ ok: boolean; data: DoctorSchedule }>(
        `${this.adminApiUrl}/${doctorId}/schedules/${scheduleId}`,
        payload
      )
      .pipe(map((res) => res.data));
  }

  deleteSchedule(doctorId: number, scheduleId: number): Observable<null> {
    return this.http
      .delete<{ ok: boolean; data: null }>(
        `${this.adminApiUrl}/${doctorId}/schedules/${scheduleId}`
      )
      .pipe(map((res) => res.data));
  }
}
