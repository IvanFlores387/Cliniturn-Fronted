import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../../shared/icons.module';
import { LucideAngularModule, LogIn, Mail, Lock } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconsModule,
    LucideAngularModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { correo } = this.loginForm.value;
      
      // Lógica de redirección basada en los roles del documento de arquitectura [cite: 134]
      if (correo.includes('admin')) {
        this.router.navigate(['/dashboard/admin']);
      } else if (correo.includes('medico')) {
        this.router.navigate(['/dashboard/medico']);
      } else {
        this.router.navigate(['/dashboard/paciente']);
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}