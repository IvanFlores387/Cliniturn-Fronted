import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { ApiResponse } from '../core/models/api-response.model';
import { MedicalRecord } from '../core/models/clinical-record.model';

export interface RecordsFilters {
  search?: string;
  doctor_id?: number | string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/records`;

  getAll(filters: RecordsFilters = {}): Observable<MedicalRecord[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.doctor_id) params = params.set('doctor_id', String(filters.doctor_id));
    if (filters.fecha_inicio) params = params.set('fecha_inicio', filters.fecha_inicio);
    if (filters.fecha_fin) params = params.set('fecha_fin', filters.fecha_fin);

    return this.http
      .get<ApiResponse<MedicalRecord[]>>(this.apiUrl, { params })
      .pipe(map((response) => response.data));
  }

  getById(id: number): Observable<MedicalRecord> {
    return this.http
      .get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  getByPatientId(patientId: number): Observable<MedicalRecord> {
    return this.http
      .get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(map((response) => response.data));
  }

  getMy(): Observable<MedicalRecord> {
    return this.http
      .get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/my`)
      .pipe(map((response) => response.data));
  }
}
