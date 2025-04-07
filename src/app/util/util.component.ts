/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
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
import { customAlphabet } from 'nanoid';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder, FormControl, FormGroup, Validators, AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn,
} from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// import { ContentSelectComponent } from '../content-select/content-select.component';
// import { ContentPreviewDialogComponent } from '../content-preview/content-preview-dialog.component';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToPreviewModel,
} from '../../model/index';
import { mediaTypeOptions } from '../../config/config';

import {
  getImgMeta, getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { TITLE, TITLE_VALUE } from '../di/DI';
/* eslint-enable @typescript-eslint/no-unused-vars */

const getI18n = (str: string): string => {
  switch (str) {
    case 'image':
      return '图片';
    case 'video':
      return '视频';
    case 'text':
      return '纯文本';
    case 'WeiBo':
      return '微博';
    case 'WeChat':
      return '微信';
    case 'Facebook':
      return '脸书';
    default:
      return '';
  }
};

@Component({
  selector: 'util',
  // templateUrl: '',
  template: '',
  styleUrls: [],
})
export class UtilComponent { // eslint-disable-line import/prefer-default-export
  titleDemo: any;

  service!: WcmService;

  constructor(
    //    protected wcmService22?: WcmService,
    private injector?: Injector,
    // @Optional() @Inject(TITLE) public title?: string,
  ) {
    LogUtil.debug(injector);
    if (injector) {
      this.titleDemo = injector.get(TITLE);
      LogUtil.debug(this.titleDemo);
      this.service = injector.get(WcmService);
      LogUtil.debug(injector.get(WcmService));
    }
  }

  getI18n = getI18n;

  mediaTypeOptions = mediaTypeOptions;
}
