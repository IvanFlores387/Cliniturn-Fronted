import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { 
  LucideAngularModule, Zap, Calendar, Users, Shield, MapPin, Clock, Phone, Mail,UserPlus, User, GraduationCap, Book, Lock
} from 'lucide-angular';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ 
      Zap, Calendar, Users, Shield, MapPin, Clock, Phone, Mail, UserPlus, User, GraduationCap, Book, Lock
    })
  ],
  exports: [ 
  ]
})
export class ScreensModule { }