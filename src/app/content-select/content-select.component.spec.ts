import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentSelectComponent } from './content-select.component';

describe('ContentSelectComponent', () => {
  let component: ContentSelectComponent;
  let fixture: ComponentFixture<ContentSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentSelectComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
