import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../../shared/icons.module';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = {
      email: this.loginForm.value.correo,
      password: this.loginForm.value.password
    };

    this.authService.login(payload).subscribe({
      next: (user) => {
        this.authService.ensureProfileLoaded(true).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.authService.redirectByRole(user.role);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.authService.redirectByRole(user.role);
          }
        });
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo iniciar sesión.');
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
