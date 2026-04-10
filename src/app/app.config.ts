import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  importProvidersFrom
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  LucideAngularModule,
  Zap,
  Calendar,
  Users,
  Shield,
  MapPin,
  Clock,
  Phone,
  Mail,
  LayoutDashboard,
  FileText,
  UserPlus,
  GraduationCap,
  Book,
  Lock,
  Menu,
  LogOut,
  User,
  Stethoscope,
  ClipboardList,
  Building2,
  TrendingUp,
  CheckCircle2,
  CircleAlert,
  BadgePlus,
  Activity,
  CalendarDays,
  NotebookPen
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(MatSnackBarModule),
    provideHttpClient(withInterceptors([authInterceptor])),

    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        Calendar,
        FileText,
        Zap,
        Users,
        Shield,
        MapPin,
        Clock,
        Phone,
        Mail,
        UserPlus,
        GraduationCap,
        Book,
        Lock,
        Menu,
        LogOut,
        User,
        Stethoscope,
        ClipboardList,
        Building2,
        TrendingUp,
        CheckCircle2,
        CircleAlert,
        BadgePlus,
        Activity,
        CalendarDays,
        NotebookPen
      })
    )
  ]
};
