import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'medico/registro-consulta/:appointmentId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'medico/historial-paciente/:patientId',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/historial-paciente/:patientId',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
