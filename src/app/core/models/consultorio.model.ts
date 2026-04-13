export interface Consultorio {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  descripcion?: string | null;
  activo: number;
  total_medicos?: number;
  created_at?: string;
  updated_at?: string;
}
