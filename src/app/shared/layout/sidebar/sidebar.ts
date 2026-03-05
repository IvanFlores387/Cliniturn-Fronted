import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {

  menu: MenuItem[] = [];

  constructor(private authService: AuthService) {
    this.loadMenu();
  }

  loadMenu() {
    const role = this.authService.getRole();

    if (role === 'medico') {
      this.menu = [
        { label: 'Dashboard', route: '/medico/dashboard', icon: 'layout-dashboard' },
        { label: 'Mis Citas', route: '/medico/mis-citas', icon: 'calendar' },
        { label: 'Expedientes', route: '/medico/expedientes', icon: 'file-text' }
      ];
    }
  }
}
