export interface ReportsSummary {
  total_citas: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
  porcentaje_cancelacion: number;
  especialidad_mas_solicitada: {
    id: number;
    nombre: string;
    total: number;
  } | null;
  medico_con_mas_citas_atendidas: {
    id: number;
    nombre: string;
    apellidos: string;
    total_atendidas: number;
  } | null;
}

export interface AppointmentsBySpecialtyItem {
  specialty_id: number;
  specialty_nombre: string;
  total: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface AppointmentsByDoctorItem {
  doctor_id: number;
  doctor_nombre: string;
  doctor_apellidos: string;
  specialty_nombre: string | null;
  total: number;
  pendientes: number;
  confirmadas: number;
  atendidas: number;
  canceladas: number;
}

export interface AppointmentsByMonthItem {
  month: string;
  total: number;
  atendidas: number;
  canceladas: number;
}

export interface CancellationRate {
  total_citas: number;
  canceladas: number;
  porcentaje_cancelacion: number;
}

export interface ReportsFilters {
  startDate?: string;
  endDate?: string;
}
