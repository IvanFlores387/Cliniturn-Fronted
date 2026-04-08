import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Doctor } from '../core/models/doctor.model';
import { AvailabilitySlot } from '../core/models/availability-slot.model';

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/doctors`;

  getAll(specialtyId?: number): Observable<Doctor[]> {
    let params = new HttpParams();

    if (specialtyId) {
      params = params.set('specialtyId', specialtyId);
    }

    return this.http.get<{ ok: boolean; data: Doctor[] }>(this.apiUrl, { params }).pipe(
      map(res => res.data)
    );
  }

  getAvailability(doctorId: number, date: string): Observable<AvailabilitySlot[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<{ ok: boolean; data: AvailabilitySlot[] }>(
      `${this.apiUrl}/${doctorId}/availability`,
      { params }
    ).pipe(map(res => res.data));
  }
}
