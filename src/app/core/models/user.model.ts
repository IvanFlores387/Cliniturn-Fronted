export type UserRole = 'paciente' | 'medico' | 'admin';

export interface User {
  id: number;
  nombre: string;
  email: string;
  role: UserRole;
  activo: boolean;

  telefono?: string;
  apellidos?: string;
  matricula?: string;
  carrera?: string;

  cedula?: string;
  especialidad?: string;

  codigoAdmin?: string;

  doctor_id?: number | null;
}
