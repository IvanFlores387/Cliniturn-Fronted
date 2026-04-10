import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Deseas continuar?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';
  @Input() loading = false;
  @Input() variant: 'primary' | 'danger' | 'success' = 'primary';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('dialog-backdrop') && !this.loading) {
      this.cancelled.emit();
    }
  }

  onCancel(): void {
    if (!this.loading) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    if (!this.loading) {
      this.confirmed.emit();
    }
  }
}
