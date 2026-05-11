import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import {
  Consultation,
  CreateConsultationPayload,
  UpdateConsultationPayload,
} from '../core/models/clinical-record.model';

@Injectable({ providedIn: 'root' })
export class ConsultationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/consultations`;

  create(payload: CreateConsultationPayload): Observable<Consultation> {
    return this.http
      .post<ApiResponse<Consultation>>(this.apiUrl, payload)
      .pipe(map((response) => response.data));
  }

  getById(id: number): Observable<Consultation> {
    return this.http
      .get<ApiResponse<Consultation>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getByAppointmentId(appointmentId: number): Observable<Consultation> {
    return this.http
      .get<ApiResponse<Consultation>>(`${this.apiUrl}/appointment/${appointmentId}`)
      .pipe(map((response) => response.data));
  }

  getByPatientId(patientId: number): Observable<Consultation[]> {
    return this.http
      .get<ApiResponse<Consultation[]>>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(map((response) => response.data));
  }

  update(id: number, payload: UpdateConsultationPayload): Observable<Consultation> {
    return this.http
      .put<ApiResponse<Consultation>>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((response) => response.data));
  }
}
