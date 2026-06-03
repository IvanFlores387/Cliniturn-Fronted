import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IconsModule } from '../../../shared/icons.module';
import { AuthService } from '../../../services/auth.service';

type PacienteFormValue = {
  nombre: string;
  apellidos: string;
  matricula: string;
  carrera: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

type MedicoFormValue = {
  nombre: string;
  apellidos: string;
  cedula: string;
  especialidad: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

type AdminFormValue = {
  nombre: string;
  apellidos: string;
  codigoAdmin: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
};

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

const textNameValidators = [
  Validators.required,
  Validators.minLength(2),
  Validators.maxLength(120),
  Validators.pattern(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/),
];

const emailValidators = [
  Validators.required,
  Validators.email,
  Validators.maxLength(150),
];

const phoneValidators = [
  Validators.required,
  Validators.pattern(/^[0-9+()\s.-]{7,20}$/),
];

const passwordValidators = [
  Validators.required,
  Validators.minLength(6),
  Validators.maxLength(72),
];

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
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
        nombre: ['', textNameValidators],
        apellidos: ['', textNameValidators],
        matricula: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        carrera: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
        correo: ['', emailValidators],
        telefono: ['', phoneValidators],
        password: ['', passwordValidators],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    this.medicoForm = this.fb.group(
      {
        nombre: ['', textNameValidators],
        apellidos: ['', textNameValidators],
        cedula: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{4,30}$/)]],
        especialidad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
        correo: ['', emailValidators],
        telefono: ['', phoneValidators],
        password: ['', passwordValidators],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );

    this.adminForm = this.fb.group(
      {
        nombre: ['', textNameValidators],
        apellidos: ['', textNameValidators],
        codigoAdmin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],
        correo: ['', emailValidators],
        telefono: ['', phoneValidators],
        password: ['', passwordValidators],
        confirmPassword: ['', Validators.required],
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

    const value = this.cleanFormValue<PacienteFormValue>(
      this.pacienteForm.getRawValue() as PacienteFormValue
    );

    this.authService.register({
      nombre: value.nombre,
      email: value.correo,
      password: value.password,
      role: 'paciente',
      telefono: value.telefono,
      apellidos: value.apellidos,
      matricula: value.matricula,
      carrera: value.carrera,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el paciente.');
      },
    });
  }

  onSubmitMedico(): void {
    if (this.medicoForm.invalid) {
      this.medicoForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const value = this.cleanFormValue<MedicoFormValue>(
      this.medicoForm.getRawValue() as MedicoFormValue
    );

    this.authService.register({
      nombre: value.nombre,
      email: value.correo,
      password: value.password,
      role: 'medico',
      telefono: value.telefono,
      apellidos: value.apellidos,
      cedula: value.cedula,
      especialidad: value.especialidad,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el médico.');
      },
    });
  }

  onSubmitAdmin(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const value = this.cleanFormValue<AdminFormValue>(
      this.adminForm.getRawValue() as AdminFormValue
    );

    this.authService.register({
      nombre: value.nombre,
      email: value.correo,
      password: value.password,
      role: 'admin',
      telefono: value.telefono,
      apellidos: value.apellidos,
      codigoAdmin: value.codigoAdmin,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo registrar el administrador.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  private cleanFormValue<T extends Record<string, string>>(value: T): T {
    const cleanedValue = { ...value };

    Object.keys(cleanedValue).forEach((key) => {
      cleanedValue[key as keyof T] = String(cleanedValue[key as keyof T] ?? '').trim() as T[keyof T];
    });

    return cleanedValue;
  }
}
