import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private role: 'paciente' | 'medico' | 'admin' = 'medico'; // cambiar para probar

  getRole() {
    return this.role;
  }

  setRole(role: 'paciente' | 'medico' | 'admin') {
    this.role = role;
  }
}
