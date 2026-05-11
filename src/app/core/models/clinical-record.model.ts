export interface VitalSigns {
  peso?: string;
  talla?: string;
  presion_arterial?: string;
  temperatura?: string;
  frecuencia_cardiaca?: string;
  frecuencia_respiratoria?: string;
}

export interface Consultation {
  id: number;
  appointment_id: number;
  record_id: number;
  doctor_id: number;
  paciente_id: number;
  diagnosis: string;
  treatment: string;
  observations?: string | null;
  vital_signs?: VitalSigns | null;
  general_indications?: string | null;
  consultation_date: string;
  created_at?: string;
  updated_at?: string;
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
  appointment_estado?: string;
  motivo_consulta?: string;
  paciente_nombre?: string;
  paciente_apellidos?: string;
  paciente_matricula?: string;
  doctor_nombre?: string;
  doctor_apellidos?: string;
  specialty_nombre?: string;
  consultorio_nombre?: string;
}

export interface MedicalRecord {
  id: number;
  paciente_id: number;
  paciente_nombre: string;
  paciente_apellidos: string;
  paciente_matricula?: string | null;
  paciente_email?: string | null;
  paciente_telefono?: string | null;
  total_consultations?: number;
  last_consultation_date?: string | null;
  last_consultation_id?: number | null;
  last_diagnosis?: string | null;
  last_treatment?: string | null;
  last_consultation_at?: string | null;
  last_doctor_nombre?: string | null;
  last_doctor_apellidos?: string | null;
  created_at?: string;
  updated_at?: string;
  consultations?: Consultation[];
}

export interface CreateConsultationPayload {
  appointment_id: number;
  diagnosis: string;
  treatment: string;
  observations?: string | null;
  vital_signs?: VitalSigns | null;
  general_indications?: string | null;
}

export type UpdateConsultationPayload = Omit<CreateConsultationPayload, 'appointment_id'>;
