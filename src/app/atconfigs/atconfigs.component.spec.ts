import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtconfigsComponent } from './atconfigs.component';

describe('AtconfigsComponent', () => {
  let component: AtconfigsComponent;
  let fixture: ComponentFixture<AtconfigsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtconfigsComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtconfigsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
