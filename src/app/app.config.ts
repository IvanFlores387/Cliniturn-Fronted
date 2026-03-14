import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

import { LucideAngularModule,Zap, Calendar, Users, Shield, MapPin, Clock, Phone, Mail, LayoutDashboard, FileText, UserPlus,GraduationCap,Book,Lock } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    importProvidersFrom(
      LucideAngularModule.pick({
        LayoutDashboard,
        Calendar,
        FileText,
        Zap,
        Users,
        Shield,
        MapPin,Clock,Phone,Mail,UserPlus,GraduationCap,Book,Lock
      })
    )
  ]
};
