export type AppointmentStatus = 'pendiente' | 'confirmada' | 'cancelada' | 'atendida';

export interface Appointment {
  id: number;
  paciente_id: number;
  doctor_id: number;
  specialty_id: number;
  consultorio_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo_consulta: string;
  estado: AppointmentStatus;
  cancelada_por?: 'paciente' | 'medico' | 'admin' | null;
  notas_cancelacion?: string | null;
  specialty_nombre?: string;
  consultorio_nombre?: string;
  doctor_nombre?: string;
  doctor_apellidos?: string;
  paciente_nombre?: string;
  paciente_apellidos?: string;
  created_at?: string;
  updated_at?: string;
}
