import { NgModule } from '@angular/core';
import { 
  LucideAngularModule, 
  // Iconos para el Registro
  UserPlus, User, GraduationCap, Book, Mail, Phone, Lock, Shield,
  // Iconos para la Landing Page
  Zap, Calendar, Users, MapPin, Clock,
  // Iconos para el Login
  LogIn
} from 'lucide-angular';

@NgModule({
  imports: [
    LucideAngularModule.pick({ 
      UserPlus, User, GraduationCap, Book, Mail, Phone, Lock, Shield,
      Zap, Calendar, Users, MapPin, Clock,
      LogIn
    })
  ],
  exports: [
    LucideAngularModule
  ]
})
export class IconsModule { }