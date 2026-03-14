import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FooterComponent } from './layout/footer/footer';
import { NavbarComponent } from './layout/navbar/navbar';
import { IconsModule } from '../shared/icons.module';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    IconsModule,
    NavbarComponent,
    FooterComponent
  ],
  exports: [
    FooterComponent,
    NavbarComponent,
    LucideAngularModule,
    IconsModule
  ]
})
export class SharedModule { }