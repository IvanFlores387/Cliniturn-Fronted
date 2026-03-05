import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximasCitas } from './proximas-citas';

describe('ProximasCitas', () => {
  let component: ProximasCitas;
  let fixture: ComponentFixture<ProximasCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximasCitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximasCitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
