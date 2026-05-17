import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { DoctorPatientHistoryItem, MedicalHistory } from '../core/models/history.model';

interface ApiResponse<T> {
  ok: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/history`;

  getPatientHistory(patientId: number): Observable<MedicalHistory> {
    return this.http
      .get<ApiResponse<MedicalHistory>>(`${this.apiUrl}/patient/${patientId}`)
      .pipe(map((res) => res.data));
  }

  getMyHistory(): Observable<MedicalHistory> {
    return this.http
      .get<ApiResponse<MedicalHistory>>(`${this.apiUrl}/my`)
      .pipe(map((res) => res.data));
  }

  getDoctorPatients(): Observable<DoctorPatientHistoryItem[]> {
    return this.http
      .get<ApiResponse<DoctorPatientHistoryItem[]>>(`${this.apiUrl}/doctor/patients`)
      .pipe(map((res) => res.data));
  }
}
