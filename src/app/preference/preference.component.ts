/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Component,
  OnInit,
  Inject,
  Injector,
  InjectionToken,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { customAlphabet } from 'nanoid';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder, FormControl, FormGroup, Validators,
} from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { MatAccordion } from '@angular/material/expansion';

import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort, SortDirection, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';

import { getFromWPS } from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: [],
})
export class PreferenceComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  @ViewChild(MatAccordion) accordion: MatAccordion;

  formData: FormGroup;

  formAT: FormGroup;

  fb: FormBuilder;

  tmpData: any = {
    accordion: {

    },
  };

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
    //  this.formData = this.fb.group({
    //    name: ['', [Validators.required, Validators.maxLength(150)]],
    //    smpType: ['WeiBo', [Validators.required, Validators.maxLength(100)]],
    //    // appKey: ['381698247', [Validators.required, Validators.maxLength(100)]],
    //    appKey: ['', [Validators.required, Validators.maxLength(100)]],
    //    // appSecret: ['b61f85ec4095c9816655c9312d46ba5d', [Validators.required, Validators.maxLength(100)]],
    //    appSecret: ['', [Validators.required, Validators.maxLength(100)]],
    //    // redirectURL: ['https://api.weibo.com/oauth2/default.html', [Validators.required, Validators.maxLength(250)]],
    //    redirectURL: ['', [Validators.required, Validators.maxLength(250)]],
    //    configId: ['', Validators.maxLength(30)],
    //  });

    this.formAT = this.fb.group({
      'weibo-image': ['', Validators.required],
      'weibo-text': ['', Validators.required],
      'weibo-video': ['', Validators.required],
    });

    //  this.route.queryParams.subscribe(params => {
    //    // console.log(params);
    //    if (params.configId) {
    //      this.isEditMode = true;
    //      const { configId, configName, smpType, appKey, appSecret, redirectURL } = params;
    //      this.formData.setValue({
    //        name: configName, smpType, appKey, appSecret, redirectURL, configId,
    //      });
    //      this.isEnabled = params.isEnabled === "true" ? true : false;
    //    }
    //  });
  }
}
