import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppointmentStatus } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-status-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-status-chip.html',
  styleUrl: './appointment-status-chip.scss',
})
export class AppointmentStatusChipComponent {
  @Input({ required: true }) status!: AppointmentStatus;

  get label(): string {
    switch (this.status) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'atendida':
        return 'Completada';
      default:
        return 'Pendiente';
    }
  }

  get cssClass(): string {
    switch (this.status) {
      case 'pendiente':
        return 'chip chip--warning';
      case 'confirmada':
        return 'chip chip--success';
      case 'cancelada':
        return 'chip chip--danger';
      case 'atendida':
        return 'chip chip--info';
      default:
        return 'chip';
    }
  }
}
