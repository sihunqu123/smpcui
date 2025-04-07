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
} from '@angular/core';
import { customAlphabet } from 'nanoid';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  Observable, ReplaySubject, of, Subject,
} from 'rxjs';
// import { ObservableInput, } from 'rxjs/types';
import {
  map, tap,
  mergeMap, catchError, startWith, debounceTime, switchMap, distinctUntilChanged,
  retry,
} from 'rxjs/operators';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder, FormControl, FormGroup, Validators,
} from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';

import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, SortDirection, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';

import { ShareConfigComponent } from './share-config.component';

import {
  generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel,
  ToBeShareModel, ToPreviewModel, PreviewModel, ToShareModel, ATMap, ATConfig,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'wecom-config',
  templateUrl: './wecom-config.component.html',
  styleUrls: [],
})
export class WeComConfigComponent extends ShareConfigComponent { // eslint-disable-line import/prefer-default-export
  constructor( // eslint-disable-line @typescript-eslint/no-useless-constructor
    fb: FormBuilder,
    injector: Injector,
  ) {
    super(fb, injector);
  }

  protected initFormGroup(): void {
    this.formMap = this.fb.group({
      title: [this.config?.map?.title, [Validators.required, Validators.maxLength(100)]],
      referFromLink: [this.config?.map?.referFromLink, [Validators.maxLength(100)]],
      cover: [this.config?.map?.cover, [Validators.maxLength(100)]],
      summary: [this.config?.map?.summary, [Validators.maxLength(100)]],
      body: [this.config?.map?.body, [Validators.required]],
    });

    this.formData = this.fb.group({
      appShareConfigId: [this.config?.appShareConfigId, [Validators.required, Validators.maxLength(100)]],
      isShare: [this.config?.isShare, [Validators.required, Validators.maxLength(100)]],
      appConfigId: [this.config?.appConfigId, [Validators.required, Validators.maxLength(100)]],
      map: this.formMap,
    });
  }

  async save() {
    const { atId } = this;
    const { atConfigId } = this;
    const { appShareConfigId } = this.config; // eslint-disable-line @typescript-eslint/no-unused-vars
    const WeComConfig = this.formData.value;
    let payload = null;
    payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
              WeCom: [
                WeComConfig,
              ],
            },
          ],
        },
      ],
    };

    const data = {
      action: 'upsert',
      payload,
    };

    try {
      await this.onSubmit(data);
      // TODO: add new atMap to preference
      // this.scopedPreference = _.merge(this.scopedPreference, payload);
      return true;
    } catch (e) {
      LogUtil.error(e);
      return false;
    }
  }
}
