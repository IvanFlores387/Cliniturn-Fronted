import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasHoy } from './citas-hoy';

describe('CitasHoy', () => {
  let component: CitasHoy;
  let fixture: ComponentFixture<CitasHoy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasHoy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasHoy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
