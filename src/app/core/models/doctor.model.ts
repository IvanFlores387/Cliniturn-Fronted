export interface Doctor {
  id: number;
  user_id: number;
  specialty_id: number;
  consultorio_id: number;
  duracion_cita_minutos: number;
  activo: number;

  nombre: string;
  apellidos: string;
  email?: string;
  user_activo?: number;

  specialty_nombre: string;
  consultorio_nombre: string;

  created_at?: string;
  updated_at?: string;
}
