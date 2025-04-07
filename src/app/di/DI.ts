/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Component,
  OnInit,
  Inject,
  Injector,
  AfterViewInit,
  ViewChild,
  InjectionToken,
  forwardRef, Optional, SkipSelf,
} from '@angular/core';
/* eslint-enable @typescript-eslint/no-unused-vars */

export const TITLE = new InjectionToken<string>('title');

export const TITLE_VALUE = 'title_value';
