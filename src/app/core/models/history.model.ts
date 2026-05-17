import { Consultation } from './clinical-record.model';

export interface HistoryPatient {
  paciente_id: number;
  paciente_nombre: string;
  paciente_apellidos: string;
  paciente_email?: string | null;
  paciente_telefono?: string | null;
  paciente_matricula?: string | null;
  record_id?: number | null;
  record_created_at?: string | null;
  record_updated_at?: string | null;
}

export interface HistoryAppointment {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo_consulta?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  doctor_id: number;
  doctor_nombre: string;
  doctor_apellidos: string;
  specialty_nombre?: string | null;
  consultorio_nombre?: string | null;
}

export interface MedicalHistory {
  patient: HistoryPatient;
  appointments: HistoryAppointment[];
  consultations: Consultation[];
  summary: {
    total_appointments: number;
    total_consultations: number;
    last_consultation_date: string | null;
  };
}

export interface DoctorPatientHistoryItem {
  paciente_id: number;
  paciente_nombre: string;
  paciente_apellidos: string;
  paciente_email?: string | null;
  paciente_telefono?: string | null;
  paciente_matricula?: string | null;
  total_citas: number;
  citas_atendidas: number;
  ultima_cita: string | null;
}
