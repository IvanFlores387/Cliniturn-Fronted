import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';

// Públicas
import { LandingComponent } from './screens/landing/landing';
import { LoginComponent } from './screens/auth/login/login';
import { RegisterComponent } from './screens/auth/register/register';

// Paciente
import { Dashboard as PacienteDashboardComponent } from './screens/paciente/dashboard/dashboard';
import { NuevaCita } from './screens/paciente/nueva-cita/nueva-cita';
import { MisCitas as PacienteMisCitasComponent } from './screens/paciente/mis-citas/mis-citas';
import { Expediente as PacienteExpedienteComponent } from './screens/paciente/expediente/expediente';
import { Estadisticas } from './screens/paciente/estadisticas/estadisticas';

// Médico
import { Dashboard as MedicoDashboardComponent } from './screens/medico/dashboard/dashboard';
import { CitasHoy } from './screens/medico/citas-hoy/citas-hoy';
import { ProximasCitas } from './screens/medico/proximas-citas/proximas-citas';
import { MisCitas as MedicoMisCitasComponent } from './screens/medico/mis-citas/mis-citas';
import { Expedientes as MedicoExpedientesComponent } from './screens/medico/expedientes/expedientes';

// Admin
import { Dashboard as AdminDashboardComponent } from './screens/admin/dashboard/dashboard';
import { GestionMedicos } from './screens/admin/gestion-medicos/gestion-medicos';
import { GestionConsultorios } from './screens/admin/gestion-consultorios/gestion-consultorios';
import { Reportes as AdminReportesComponent } from './screens/admin/reportes/reportes';
import { Expedientes as AdminExpedientesComponent } from './screens/admin/expedientes/expedientes';

export const routes: Routes = [


 // RUTAS PÚBLICAS
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  // PACIENTE
 {
  path: 'paciente',
  component: MainLayoutComponent,
  children: [
    { path: 'dashboard', component: PacienteDashboardComponent },
    { path: 'nueva-cita', component: NuevaCita },
    { path: 'mis-citas', component: PacienteMisCitasComponent },
    { path: 'expediente', component: PacienteExpedienteComponent },
    { path: 'estadisticas', component: Estadisticas },
  ]
},
  // MÉDICO
 {
  path: 'medico',
  component: MainLayoutComponent,
  children: [
    { path: 'dashboard', component: MedicoDashboardComponent },
    { path: 'citas-hoy', component: CitasHoy },
    { path: 'proximas-citas', component: ProximasCitas },
    { path: 'mis-citas', component: MedicoMisCitasComponent },
    { path: 'expedientes', component: MedicoExpedientesComponent },
  ]
},
  // ADMIN
 {
  path: 'admin',
  component: MainLayoutComponent,
  children: [
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'gestion-medicos', component: GestionMedicos },
    { path: 'gestion-consultorios', component: GestionConsultorios },
    { path: 'reportes', component: AdminReportesComponent },
    { path: 'expedientes', component: AdminExpedientesComponent },
  ]
},
  // Ruta comodín
  { path: '**', redirectTo: '' }

];
