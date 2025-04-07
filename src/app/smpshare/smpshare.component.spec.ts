import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmpshareComponent } from './smpshare.component';

describe('SmpshareComponent', () => {
  let component: SmpshareComponent;
  let fixture: ComponentFixture<SmpshareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmpshareComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmpshareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
