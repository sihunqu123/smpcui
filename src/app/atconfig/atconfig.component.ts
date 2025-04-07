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

import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'atConfig',
  templateUrl: './atconfig.component.html',
  styleUrls: [],
})
export class AtconfigComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  @Input() atConfig: any = null;

  @Input() atId: string = '';

  @Input() onSubmit: Function = null;

  formData: FormGroup;

  fb: FormBuilder;

  tmpData: any = {
    openedPanel: '',
  };

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    private matPaginatorIntl: MatPaginatorIntl,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
    this.formData = this.fb.group({
    });
  }

  // ngOnInit(): void {
  // }

  async deleteATShareConfig(event, type, appShareConfigId) {
    event.stopPropagation();
    const { atId } = this;
    const { atConfigId } = this.atConfig;
    const payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
              [type]: [
                {
                  appShareConfigId,
                },
              ],
            },
          ],
        },
      ],
    };

    const data = {
      action: 'delete',
      payload,
    };

    try {
      await this.onSubmit(data);
      // TODO: add new atMap to preference
      // this.scopedPreference = _.merge(this.scopedPreference, payload);
    } catch (e) {
      LogUtil.error(e);
    }
  }

  async addAppShareConfig(type) {
    LogUtil.debug(`add ${type} share config`);
    const { atId } = this;
    let payload = null;
    const { atConfigId } = this.atConfig;
    const appShareConfigId = generateNanoid();
    switch (type) {
      case 'WeiBo':
        payload = {
          atMaps: [
            {
              atId,
              atConfigs: [
                {
                  atConfigId,
                  [type]: [
                    {
                      appShareConfigId,
                      isShare: false,
                      shareTypePriority: [
                        'video',
                        'image',
                        'text',
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };
        break;
      case 'WeCom':
      case 'WeChat':
        payload = {
          atMaps: [
            {
              atId,
              atConfigs: [
                {
                  atConfigId,
                  [type]: [
                    {
                      appShareConfigId,
                      isShare: false,
                    },
                  ],
                },
              ],
            },
          ],
        };
        break;
      case 'Facebook':
        payload = {
          atMaps: [
            {
              atId,
              atConfigs: [
                {
                  atConfigId,
                  [type]: [
                    {
                      appShareConfigId,
                      isShare: false,
                    },
                  ],
                },
              ],
            },
          ],
        };
        break;
      default:
        this._snackBar.open('类型参数错误!', 'X', {
          duration: 3000,
        });
        return false;
    }

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
