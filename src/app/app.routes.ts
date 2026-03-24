import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout';

import { LandingComponent } from './screens/landing/landing';
import { LoginComponent } from './screens/auth/login/login';
import { RegisterComponent } from './screens/auth/register/register';

import { Dashboard as PacienteDashboardComponent } from './screens/paciente/dashboard/dashboard';
import { NuevaCita } from './screens/paciente/nueva-cita/nueva-cita';
import { MisCitas as PacienteMisCitasComponent } from './screens/paciente/mis-citas/mis-citas';
import { Expediente as PacienteExpedienteComponent } from './screens/paciente/expediente/expediente';
import { Estadisticas } from './screens/paciente/estadisticas/estadisticas';

import { Dashboard as MedicoDashboardComponent } from './screens/medico/dashboard/dashboard';
import { CitasHoy } from './screens/medico/citas-hoy/citas-hoy';
import { ProximasCitas } from './screens/medico/proximas-citas/proximas-citas';
import { MisCitas as MedicoMisCitasComponent } from './screens/medico/mis-citas/mis-citas';
import { Expedientes as MedicoExpedientesComponent } from './screens/medico/expedientes/expedientes';

import { Dashboard as AdminDashboardComponent } from './screens/admin/dashboard/dashboard';
import { GestionMedicos } from './screens/admin/gestion-medicos/gestion-medicos';
import { GestionConsultorios } from './screens/admin/gestion-consultorios/gestion-consultorios';
import { Reportes as AdminReportesComponent } from './screens/admin/reportes/reportes';
import { Expedientes as AdminExpedientesComponent } from './screens/admin/expedientes/expedientes';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },

  {
    path: 'paciente',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: 'dashboard', component: PacienteDashboardComponent },
      { path: 'nueva-cita', component: NuevaCita },
      { path: 'mis-citas', component: PacienteMisCitasComponent },
      { path: 'expediente', component: PacienteExpedienteComponent },
      { path: 'estadisticas', component: Estadisticas },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'medico',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['medico'] },
    children: [
      { path: 'dashboard', component: MedicoDashboardComponent },
      { path: 'citas-hoy', component: CitasHoy },
      { path: 'proximas-citas', component: ProximasCitas },
      { path: 'mis-citas', component: MedicoMisCitasComponent },
      { path: 'expedientes', component: MedicoExpedientesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'gestion-medicos', component: GestionMedicos },
      { path: 'gestion-consultorios', component: GestionConsultorios },
      { path: 'reportes', component: AdminReportesComponent },
      { path: 'expedientes', component: AdminExpedientesComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '' }
];
