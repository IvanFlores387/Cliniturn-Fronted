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
  recent_appointments: PatientDashboardAppointment[];
}

export interface DoctorDashboardTotals {
  total_citas: number;
  citas_hoy: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface DoctorDashboardAppointment {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo_consulta: string;
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
  recent_appointments: AdminDashboardAppointment[];
}
