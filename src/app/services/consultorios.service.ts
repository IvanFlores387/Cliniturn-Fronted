import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Consultorio } from '../core/models/consultorio.model';

export interface ConsultorioFilters {
  search?: string;
  activo?: number | '';
}

export interface SaveConsultorioPayload {
  nombre: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  activo?: number;
}

@Injectable({ providedIn: 'root' })
export class ConsultoriosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/consultorios`;

  getAll(filters?: ConsultorioFilters): Observable<Consultorio[]> {
    let params = new HttpParams();

    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters?.activo !== '' && filters?.activo !== undefined) {
      params = params.set('activo', String(filters.activo));
    }

    return this.http
      .get<{ ok: boolean; data: Consultorio[] }>(this.apiUrl, { params })
      .pipe(map((res) => res.data));
  }

  getById(id: number): Observable<Consultorio> {
    return this.http
      .get<{ ok: boolean; data: Consultorio }>(`${this.apiUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: SaveConsultorioPayload): Observable<Consultorio> {
    return this.http
      .post<{ ok: boolean; data: Consultorio }>(this.apiUrl, payload)
      .pipe(map((res) => res.data));
  }

  update(id: number, payload: SaveConsultorioPayload): Observable<Consultorio> {
    return this.http
      .put<{ ok: boolean; data: Consultorio }>(`${this.apiUrl}/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  toggleStatus(id: number, activo: number): Observable<Consultorio> {
    return this.http
      .patch<{ ok: boolean; data: Consultorio }>(`${this.apiUrl}/${id}/toggle`, { activo })
      .pipe(map((res) => res.data));
  }
}
