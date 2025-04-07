/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import {
  Component,
  OnInit,
  OnChanges,
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

import { generateNanoid, customizePaginatorTxt, LogUtil } from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel, ATConfig, WeiBo, PreviewDataModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'atConfigs',
  templateUrl: './atconfigs.component.html',
  styleUrls: [],
})
export class AtconfigsComponent extends CommonParent implements OnInit, OnChanges { // eslint-disable-line import/prefer-default-export
  @Input() atMap: any = {};

  @Input() onSubmit: Function = null;

  @Input() openStats!: any;

  @Output() openStatsChange = new EventEmitter<any>();

  setOpenStats(val) :void {
    this.openStatsChange.emit(val);
  }

  @Output() selectATConfig = new EventEmitter<ATConfig>();

  formData: FormGroup;

  fb: FormBuilder;

  tmpData: any = {
    atMapNameMode: {
    },
  };

  configSelection = null;

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

  ngOnInit(): void {
    this.syncOpenStats();
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.openStats && changes.openStats.currentValue) {
      // reset to page 0 when queryTxt changed.
      setTimeout(() => this.syncOpenStats(), 5);
      // console.info(`atConfigs changes.openStats: ${JSON.stringify(changes.openStats.currentValue)}`);
    }
    //  if(changes.excludedItems) {
    //    console.info(`this.lastExcludedItems: ${this.lastExcludedItems}, changes.excludedItems.currentValue: ${changes.excludedItems.currentValue}, equal:${changes.excludedItems.currentValue ===  this.lastExcludedItems}`);
    //    this.lastExcludedItems = changes.excludedItems.currentValue;
    //    this.removeAddedItemsFromDataSourceContent();
    //  }
  }

  syncOpenStats() {
    // initialize openStats
    const openStats = this.atMap.atConfigs.reduce((accumulator, atConfig) => {
      const { atConfigId } = atConfig;
      return {
        ...accumulator,
        [atConfigId]: {
          isOpen: false,
          child: {},
        },
      };
    }, {});
    _.merge(openStats, this.openStats);
    _.merge(this.openStats, openStats);
    // console.info(`atConfigs changes.openStats: ${JSON.stringify(this.openStats)}`);
  }

  // addConfig() {
  // }

  async deleteATConfig(event, atConfigId) {
    event.stopPropagation();
    const { atId } = this.atMap;
    const payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
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

  async renameATConfig(event, atId, atConfigId, newName) {
    event.stopPropagation();
    const payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
              atConfigName: newName,
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
      event.stopPropagation();
    } catch (e) {
      LogUtil.error(e);
    }
  }

  async setDefaultATConfig(event, atConfigId) {
    event.stopPropagation();
    const { atId } = this.atMap;
    const payload = {
      atMaps: [
        {
          atId,
          defaultATConfigId: atConfigId,
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
    } catch (e) {
      LogUtil.error(e);
    }
  }

  chooseConfig(event, atConfig) {
    event.stopPropagation();
    this.configSelection = atConfig;
    this.selectATConfig.emit(atConfig);
  }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    LogUtil.debug(`atConfigs openStats: ${JSON.stringify(this.openStats, null, 2)}`);
  }
}
