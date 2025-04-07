import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppconfigComponent } from './appconfig.component';

describe('AppconfigComponent', () => {
  let component: AppconfigComponent;
  let fixture: ComponentFixture<AppconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppconfigComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
