import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmpConfigComponent } from './smp-config.component';

describe('SmpConfigComponent', () => {
  let component: SmpConfigComponent;
  let fixture: ComponentFixture<SmpConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmpConfigComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmpConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
