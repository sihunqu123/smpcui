import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmpConfigListComponent } from './smp-config-list.component';

describe('SmpConfigListComponent', () => {
  let component: SmpConfigListComponent;
  let fixture: ComponentFixture<SmpConfigListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmpConfigListComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmpConfigListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
