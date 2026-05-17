export interface PatientDashboardTotals {
  total_citas: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface PatientDashboardAppointment {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo_consulta: string;
  doctor_nombre: string;
  doctor_apellidos: string;
  specialty_nombre: string;
  consultorio_nombre: string;
}

export interface PatientDashboardData {
  totals: PatientDashboardTotals;
  next_appointment: PatientDashboardAppointment | null;
  upcoming_appointments?: PatientDashboardAppointment[];
  recent_appointments: PatientDashboardAppointment[];
}

export interface DoctorDashboardTotals {
  total_citas: number;
  citas_hoy: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
  pacientes_atendidos?: number;
  consultas_registradas?: number;
}

export interface DoctorDashboardAppointment {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo_consulta: string;
  paciente_id?: number;
  paciente_nombre: string;
  paciente_apellidos: string;
  specialty_nombre: string;
  consultorio_nombre: string;
}

export interface DoctorDashboardData {
  totals: DoctorDashboardTotals;
  today_appointments: DoctorDashboardAppointment[];
  upcoming_appointments: DoctorDashboardAppointment[];
}

export interface AdminDashboardTotals {
  total_citas: number;
  citas_hoy: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface AdminDashboardCatalogStats {
  pacientes_activos?: number;
  medicos_activos: number;
  consultorios_activos: number;
  especialidades_activas: number;
}

export interface AdminDashboardAppointment {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  paciente_nombre: string;
  paciente_apellidos: string;
  doctor_nombre: string;
  doctor_apellidos: string;
  specialty_nombre: string;
  consultorio_nombre: string;
}

export interface AdminDashboardData {
  totals: AdminDashboardTotals;
  catalog_stats: AdminDashboardCatalogStats;
  top_specialty?: { nombre: string; total: number } | null;
  recent_appointments: AdminDashboardAppointment[];
}
