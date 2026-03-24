import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  stats = [
    { label: 'Total de Citas', value: 4, icon: 'calendar', tone: 'blue' },
    { label: 'Pendientes', value: 1, icon: 'circle-alert', tone: 'yellow' },
    { label: 'Confirmadas', value: 1, icon: 'check-circle2', tone: 'green' },
    { label: 'Completadas', value: 1, icon: 'activity', tone: 'purple' }
  ];

  upcomingAppointments = [
    {
      especialidad: 'Medicina General',
      estado: 'Confirmada',
      medico: 'Dr. Carlos Rodríguez',
      fecha: '10 de febrero, 2026',
      hora: '10:00',
      consultorio: 'Consultorio A',
      motivo: 'Consulta de seguimiento general',
      tone: 'green'
    },
    {
      especialidad: 'Psicología',
      estado: 'Pendiente',
      medico: 'Dra. Laura Hernández',
      fecha: '15 de febrero, 2026',
      hora: '14:00',
      consultorio: 'Consultorio Psicología',
      motivo: 'Manejo de estrés académico',
      tone: 'yellow'
    }
  ];

  historyAppointments = [
    {
      especialidad: 'Odontología',
      estado: 'Cancelada',
      medico: 'Dr. Miguel Sánchez',
      fecha: '25 de enero, 2026',
      hora: '09:00',
      consultorio: 'Consultorio Dental',
      motivo: 'Limpieza dental',
      tone: 'red',
      cancelacion: 'Conflicto de horarios con examen'
    },
    {
      especialidad: 'Medicina General',
      estado: 'Completada',
      medico: 'Dr. Carlos Rodríguez',
      fecha: '20 de enero, 2026',
      hora: '11:00',
      consultorio: 'Consultorio A',
      motivo: 'Revisión general',
      tone: 'blue'
    }
  ];
}
