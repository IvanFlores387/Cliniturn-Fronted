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
    { label: 'Total de Citas', value: 2, icon: 'calendar', tone: 'blue' },
    { label: 'Pendientes', value: 0, icon: 'circle-alert', tone: 'yellow' },
    { label: 'Confirmadas', value: 1, icon: 'check-circle2', tone: 'green' },
    { label: 'Completadas', value: 1, icon: 'activity', tone: 'purple' }
  ];
}
