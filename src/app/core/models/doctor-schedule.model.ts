export interface DoctorSchedule {
  id: number;
  doctor_id: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: number;
  created_at?: string;
  updated_at?: string;
}

export interface DoctorScheduleResponse {
  doctor: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  schedules: DoctorSchedule[];
}
