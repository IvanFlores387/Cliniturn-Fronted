import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 

import { IconsModule } from '../../../shared/icons.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    IconsModule 
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  // Controla qué formulario se está mostrando en pantalla
  activeTab: 'paciente' | 'medico' | 'admin' = 'paciente';

  // Tres formularios completamente independientes
  pacienteForm!: FormGroup;
  medicoForm!: FormGroup;
  adminForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // 1. Registro exclusivo para PACIENTE
    this.pacienteForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      matricula: ['', Validators.required],
      carrera: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    // 2. Registro exclusivo para MÉDICO
    this.medicoForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      cedula: ['', Validators.required],
      especialidad: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });

    // 3. Registro exclusivo para ADMINISTRADOR
    this.adminForm = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      codigoAdmin: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Función para cambiar entre las pestañas
  setTab(tab: 'paciente' | 'medico' | 'admin'): void {
    this.activeTab = tab;
  }

  // --- Funciones de envío separadas para cada rol ---
  onSubmitPaciente(): void {
    if (this.pacienteForm.valid) {
      console.log('Registrando Paciente:', { ...this.pacienteForm.value, rol: 'paciente' });
      this.router.navigate(['/auth/login']);
    } else {
      this.pacienteForm.markAllAsTouched();
    }
  }

  onSubmitMedico(): void {
    if (this.medicoForm.valid) {
      console.log('Registrando Médico:', { ...this.medicoForm.value, rol: 'medico' });
      this.router.navigate(['/auth/login']);
    } else {
      this.medicoForm.markAllAsTouched();
    }
  }

  onSubmitAdmin(): void {
    if (this.adminForm.valid) {
      console.log('Registrando Administrador:', { ...this.adminForm.value, rol: 'admin' });
      this.router.navigate(['/auth/login']);
    } else {
      this.adminForm.markAllAsTouched();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}