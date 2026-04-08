import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Specialty } from '../core/models/specialty.model';

@Injectable({ providedIn: 'root' })
export class SpecialtiesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/specialties`;

  getAll(): Observable<Specialty[]> {
    return this.http.get<{ ok: boolean; data: Specialty[] }>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }
}
