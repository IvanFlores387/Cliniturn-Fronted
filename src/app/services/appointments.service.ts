import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Appointment } from '../core/models/appointment.model';

export interface CreateAppointmentPayload {
  doctor_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo_consulta: string;
}

export interface AppointmentFilters {
  estado?: string;
  fecha?: string;
  medico?: string;
  especialidad?: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/appointments`;

  create(payload: CreateAppointmentPayload): Observable<Appointment> {
    return this.http.post<{ ok: boolean; data: Appointment }>(this.apiUrl, payload).pipe(
      map(res => res.data)
    );
  }

  getMy(): Observable<Appointment[]> {
    return this.http.get<{ ok: boolean; data: Appointment[] }>(`${this.apiUrl}/my`).pipe(
      map(res => res.data)
    );
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<{ ok: boolean; data: Appointment[] }>(`${this.apiUrl}/doctor`).pipe(
      map(res => res.data)
    );
  }

  getAll(filters?: AppointmentFilters): Observable<Appointment[]> {
    let params = new HttpParams();

    if (filters?.estado) params = params.set('estado', filters.estado);
    if (filters?.fecha) params = params.set('fecha', filters.fecha);
    if (filters?.medico) params = params.set('medico', filters.medico);
    if (filters?.especialidad) params = params.set('especialidad', filters.especialidad);

    return this.http.get<{ ok: boolean; data: Appointment[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  confirm(id: number): Observable<Appointment> {
    return this.http.patch<{ ok: boolean; data: Appointment }>(`${this.apiUrl}/${id}/confirm`, {}).pipe(
      map(res => res.data)
    );
  }

  cancel(id: number, notas_cancelacion?: string): Observable<Appointment> {
    return this.http.patch<{ ok: boolean; data: Appointment }>(
      `${this.apiUrl}/${id}/cancel`,
      { notas_cancelacion }
    ).pipe(map(res => res.data));
  }

  attended(id: number): Observable<Appointment> {
    return this.http.patch<{ ok: boolean; data: Appointment }>(`${this.apiUrl}/${id}/attended`, {}).pipe(
      map(res => res.data)
    );
  }
}
