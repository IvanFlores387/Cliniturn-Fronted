import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvailabilitySlot } from '../../../../core/models/availability-slot.model';

@Component({
  selector: 'app-availability-slot-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './availability-slot-card.html',
  styleUrl: './availability-slot-card.scss',
})
export class AvailabilitySlotCardComponent {
  @Input({ required: true }) slot!: AvailabilitySlot;
  @Input() selected = false;

  @Output() selectedChange = new EventEmitter<AvailabilitySlot>();

  onSelect(): void {
    this.selectedChange.emit(this.slot);
  }
}
