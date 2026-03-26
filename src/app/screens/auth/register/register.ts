import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  activeTab: 'paciente' | 'medico' | 'admin' = 'paciente';

  pacienteForm!: FormGroup;
  medicoForm!: FormGroup;
  adminForm!: FormGroup;

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.pacienteForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        matricula: ['', Validators.required],
        carrera: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );

    this.medicoForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        cedula: ['', Validators.required],
        especialidad: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );

    this.adminForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellidos: ['', Validators.required],
        codigoAdmin: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      { validators: passwordMatchValidator }
    );
  }

  setTab(tab: 'paciente' | 'medico' | 'admin'): void {
    this.activeTab = tab;
    this.errorMessage.set('');
  }

  onSubmitPaciente(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const value = this.pacienteForm.getRawValue();

    this.authService.register({
      nombre: `${value.nombre} ${value.apellidos}`.trim(),
      email: value.correo,
      password: value.password,
      role: 'paciente',
      telefono: value.telefono,
      apellidos: value.apellidos,
      matricula: value.matricula,
      carrera: value.carrera
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el paciente.');
      }
    });
  }

  onSubmitMedico(): void {
    if (this.medicoForm.invalid) {
      this.medicoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const value = this.medicoForm.getRawValue();

    this.authService.register({
      nombre: `${value.nombre} ${value.apellidos}`.trim(),
      email: value.correo,
      password: value.password,
      role: 'medico',
      telefono: value.telefono,
      apellidos: value.apellidos,
      cedula: value.cedula,
      especialidad: value.especialidad
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el médico.');
      }
    });
  }

  onSubmitAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const value = this.adminForm.getRawValue();

    this.authService.register({
      nombre: `${value.nombre} ${value.apellidos}`.trim(),
      email: value.correo,
      password: value.password,
      role: 'admin',
      telefono: value.telefono,
      apellidos: value.apellidos,
      codigoAdmin: value.codigoAdmin
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el administrador.');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
