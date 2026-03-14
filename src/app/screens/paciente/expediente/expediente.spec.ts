import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Expediente } from './expediente';

describe('Expediente', () => {
  let component: Expediente;
  let fixture: ComponentFixture<Expediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expediente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Expediente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
