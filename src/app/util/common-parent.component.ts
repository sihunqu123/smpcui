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
import { DOCUMENT } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';
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
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToPreviewModel, EnableFailedItem, EffectivePreferenceModel,
} from '../../model/index';
import {
  initConfig, getPreference, getEffectivePreference, mediaTypeOptions, previewOptions,
} from '../../config/config';

import { ConfirmComponent } from './confirm/confirm.component';

import { TITLE, TITLE_VALUE } from '../di/DI';

import { isDebug, LogUtil } from '../../utils/utils';
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
      return '微信公众号';
    case 'WeCom':
      return '企业微信';
    case 'Facebook':
      return '脸书';
    default:
      return '';
  }
};

@Component({
  selector: 'common-parent',
  // templateUrl: '',
  template: '',
  styleUrls: [],
})
export class CommonParent implements OnInit { // eslint-disable-line import/prefer-default-export
  window: any = null;

  document: Document = null;

  titleDemo: any;

  isDebug = isDebug;

  wcmService!: WcmService;

  router!: Router;

  confirmDialog!: MatDialog;

  _snackBar!: MatSnackBar;

  effectivePreference!: EffectivePreferenceModel;
  // preference!: any;

  constructor(
    //    protected wcmService22?: WcmService,
    private injector?: Injector,
    // @Optional() @Inject(TITLE) public title?: string,
  ) {
    // console.info(injector);
    if (injector) {
      this.titleDemo = injector.get(TITLE);
      // console.info(this.titleDemo);
      this.wcmService = injector.get(WcmService);
      this.window = this.wcmService.window;
      // console.info(this.wcmService);
      this.router = injector.get(Router);
      this._snackBar = injector.get(MatSnackBar);
      this.confirmDialog = injector.get(MatDialog);
      // this.window = this.document.defaultView;
      // console.info(this.confirmDialog);
      initConfig({
        wcmService: this.wcmService,
        _snackBar: this._snackBar,
      });
      // this.initComponent();
    }
  }

  ngOnInit(): void {
    LogUtil.debug(`common-parent: ${this.injector}`);
  }

  async initComponent(): Promise<any> {
    this.effectivePreference = await getEffectivePreference();
  }

  getI18n: Function = getI18n;

  mediaTypeOptions: any = mediaTypeOptions;

  previewOptions: any = previewOptions;

  async toggleEnableReq(configId: string, targetStatus: boolean, configType: string): Promise<EnableFailedItem[]> {
    const data = { ids: [configId], targetStatus };
    const action = targetStatus ? '启用' : '禁用';
    let handleFn;
    switch (configType) {
      case 'appconfig':
        handleFn = 'enableAPPConfig';
        break;
      case 'smpconfig':
        // TODO: how to select the fixed image template?
      default: // eslint-disable-line no-fallthrough
        handleFn = 'enableSMPConfig';
    }
    return new Promise((resolve, reject) => {
      this.wcmService[handleFn](data).subscribe((res: any) => {
        LogUtil.debug(`disable config result: ${JSON.stringify(res)}`);
        if (res.status === 200) {
          // toggle returned
          return resolve(res.failed || []);
        }
        let errorMsg;
        // toggle system error
        if (res.errorCode === 'ERR_NOT_FOUND') {
          errorMsg = `${action}失败, 找不到该配置`;
        } else {
          errorMsg = `${action}失败, 服务器内部错误`;
        }
        return reject(errorMsg);
      });
    });
  }

  async openConfirmDailog(title: string, content: string): Promise<boolean> { // eslint-disable-line @typescript-eslint/no-unused-vars
    const dialogRef = this.confirmDialog.open(ConfirmComponent, {
      backdropClass: 'confirm-dialog-backdropClass',
      panelClass: 'confirm-dialog-panel',
      data: {
        title: '提示',
        content: '该配置尚未启用, 您确认要退出吗?',
      },
    });

    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result) => {
        LogUtil.debug(`Dialog result: ${result}`);
        return resolve(result);
      });
    });
  }
}
