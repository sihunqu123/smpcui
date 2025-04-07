import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WechatConfigComponent } from './wechat-config.component';

describe('WechatConfigComponent', () => {
  let component: WechatConfigComponent;
  let fixture: ComponentFixture<WechatConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WechatConfigComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WechatConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
