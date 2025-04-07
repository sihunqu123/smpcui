import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtconfigComponent } from './atconfig.component';

describe('AtconfigComponent', () => {
  let component: AtconfigComponent;
  let fixture: ComponentFixture<AtconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtconfigComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
