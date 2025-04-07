/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import {
  Component,
  OnInit,
  Input,
  Inject,
  Injector,
  InjectionToken,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
  ContentChild,
  TemplateRef,
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
import { BreakpointObserver, MediaMatcher } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { MatSidenav } from '@angular/material/sidenav';

import { CommonParent } from '../util';
import { getFromWPS, getURL, LogUtil } from '../../utils/utils';

import { ContentSelectComponent } from '../content-select/content-select.component';
import { ContentPreviewDialogComponent } from '../content-preview/content-preview-dialog.component';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToPreviewModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: [],
})
export class HomeComponent implements OnInit, OnDestroy { // eslint-disable-line import/prefer-default-export
  @Input() activeId: string = '';

  @Input() isOrphan: boolean = false;

  @ContentChild('togglerContentTpl', { read: TemplateRef })
  contentTpl: TemplateRef<any>;

  isInPortal: any = getFromWPS('userId');

  isEditMode: boolean = !!getFromWPS('isEditMode');

  // displayName: string = getFromWPS('displayName') || 'wpsadmin';
  displayName: string = getFromWPS('displayName') || '管理员';

  constructor(
    fb: FormBuilder,
    private _snackBar: MatSnackBar,
    breakpointObserver: BreakpointObserver,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    // injector: Injector,
  ) {
    // super(injector);
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    // TODO: remove this hack
    if (this.displayName === 'wpsadmin') {
      this.displayName = '管理员';
    }
  }

  ngOnInit(): void {
    LogUtil.debug(`============= isInPortal: ${this.isInPortal},
      isEditMode: ${getFromWPS('isEditMode')}
      displayName: ${getFromWPS('displayName')}
      shouldRun: ${this.shouldRun}
      `);
  }

  shouldRun: boolean = true;

  mobileQuery?: MediaQueryList;

  fillerNav: any[] = [
    {
      name: '首页', routerLink: '/home', id: 'home', icon: 'home',
    },
    //  auto-share is implemented via properpy file now, so no need to set it from UI
    //  { name: '新建社交媒体自动分享配置', routerLink: '/smp-config', id: 'smpconfig', icon: 'android' },
    //  { name: '社交媒体自动分享配置管理', routerLink: '/smp-config-list', id: 'smpconfig-list', icon: 'line_weight' },
    {
      name: '新建社交媒体密钥', routerLink: '/appconfig', id: 'appconfig', icon: 'https',
    },
    {
      name: '社交媒体密钥管理', routerLink: '/appconfig-list', id: 'appconfig-list', icon: 'list',
    },
    {
      name: '社交媒体手动分享', routerLink: '/smpshare', id: 'smpshare', icon: 'share',
    },
    //  { name: '审批并分享', routerLink: '/publicshare', id: 'publicshare', icon: 'rate_review' },
    {
      name: '偏好设置', routerLink: '/preference', id: 'preference', icon: 'settings',
    },
  ];

  private _mobileQueryListener: () => void;

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }
}
