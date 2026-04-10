import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-error'],
    });
  }

  info(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-info'],
    });
  }
}
