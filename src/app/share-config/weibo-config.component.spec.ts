import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeiboConfigComponent } from './weibo-config.component';

describe('WeiboConfigComponent', () => {
  let component: WeiboConfigComponent;
  let fixture: ComponentFixture<WeiboConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeiboConfigComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeiboConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
