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
    { label: 'Citas Pendientes', value: 1, icon: 'circle-alert', tone: 'yellow' },
    { label: 'Citas Confirmadas', value: 1, icon: 'check-circle2', tone: 'green' },
    { label: 'Tasa de Cancelación', value: '25%', icon: 'trending-up', tone: 'red' }
  ];

  shortcuts = [
    {
      title: 'Gestionar Médicos',
      value: 4,
      description: 'Ver, agregar y editar información de médicos',
      icon: 'users',
      tone: 'blue'
    },
    {
      title: 'Gestionar Consultorios',
      value: 5,
      description: 'Ver, agregar y editar consultorios disponibles',
      icon: 'building2',
      tone: 'green'
    },
    {
      title: 'Ver Reportes Detallados',
      value: null,
      description: 'Análisis estadístico completo del sistema',
      icon: 'clipboard-list',
      tone: 'purple'
    }
  ];

  summary = [
    { label: 'Pendientes', value: 1, tone: 'yellow' },
    { label: 'Confirmadas', value: 1, tone: 'green' },
    { label: 'Completadas', value: 1, tone: 'blue' },
    { label: 'Canceladas', value: 1, tone: 'red' }
  ];
}
