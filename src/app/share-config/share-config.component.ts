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
  generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel,
  ToBeShareModel, ToPreviewModel, PreviewModel, ToShareModel, ATMap, ATConfig,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'share-config',
  templateUrl: './weibo-config.component.html',
  styleUrls: [],
})
export class ShareConfigComponent extends CommonParent implements OnInit { // eslint-disable-line import/prefer-default-export
  @Input() config: any = null;

  @Input() atId: string = '';

  @Input() atConfigId: string = '';

  @Input() onSubmit: Function = null;

  @ViewChild('shareTypePriority') shareTypePriority;

  formData: FormGroup;

  fb: FormBuilder;

  tmpData: any = {};

  formMap: FormGroup;

  dataSourceTypePrior = new MatTableDataSource<string>();

  displayedColumnsTypePrior = ['type', 'action'];

  dataSourceBody = new MatTableDataSource<string>();

  displayedColumnsBody = ['field', 'action'];

  currentATFields: any[] = [];

  previewItems: ContentModel[];

  previewOption: any = {
    isShowPC: false,
    isShowMobile: true,
    isNeedReverse: false,
    isList: true,
    currentIndex: 0,
  };

  constructor(
    fb: FormBuilder,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
  }

  ngOnInit(): void {
    this.initFormGroup();

    // TODO: remove this mok
    this.formData.patchValue({
      shareTypePriority: ['image', 'video', 'text'],
    });

    this.dataSourceTypePrior.data = this.formData.value.shareTypePriority;
    // this.dataSourceTypePrior.data = this.config?.shareTypePriority;

    this.dataSourceBody.data = this.formData.value.map.body;

    this.getElementsOfAT(this.atId);

    if (this.config.appConfigId) { // init appConfig details if appCionfig already selected
      const appconfigIds = [this.config.appConfigId];
      this.wcmService.getGivenAppconfigs(appconfigIds).subscribe((response: any) => {
        const appconfigs = response.content;
        const matchedAppconfig = appconfigs.filter((appconfig) => appconfig.configId === this.config.appConfigId);
        if (matchedAppconfig.length === 1) {
          [this.tmpData.appConfig] = matchedAppconfig;
        } else {
          LogUtil.debug(`failed to fetch name of appconfig ${this.config.appConfigId}, is it deleted?`);
        }
      });
    }
  }

  // TODO: implemented by child component
  protected initFormGroup(): void {
    this.formMap = this.fb.group({
      title: [this.config?.map?.title, [Validators.required, Validators.maxLength(100)]],
      referFromLink: [this.config?.map?.referFromLink, [Validators.required, Validators.maxLength(100)]],
      body: [this.config?.map?.body, [Validators.required]],
    });

    this.formData = this.fb.group({
      appShareConfigId: [this.config?.appShareConfigId, [Validators.required, Validators.maxLength(100)]],
      isShare: [this.config?.isShare, [Validators.required, Validators.maxLength(100)]],
      shareTypePriority: [this.config?.shareTypePriority, [Validators.required, Validators.maxLength(100)]],
      appConfigId: [this.config?.appConfigId, [Validators.required, Validators.maxLength(100)]],
      map: this.formMap,
    });
  }

  movePriority(type, action) {
    LogUtil.debug(`type: ${type}, action: ${action}`);
    const newArr = moveElement(this.formData.value.shareTypePriority, type, action);
    this.formData.patchValue({
      shareTypePriority: newArr,
    });
    this.dataSourceTypePrior.data = this.formData.value.shareTypePriority;
  }

  moveBody(type, action) {
    LogUtil.debug(`type: ${type}, action: ${action}`);
    const newArr = moveElement(this.formMap.value.body || [], type, action);
    if (action === 'add') {
      this.tmpData.fieldsToAdd = null;
    }

    this.formMap.patchValue({
      body: newArr,
    });
    this.dataSourceBody.data = this.formMap.value.body;
  }

  onAppconfigSelect(row: APPConfigModel) {
    this.tmpData.appConfig = row;
    this.formData.patchValue({
      appConfigId: row.configId,
    });
  }

  getElementsOfAT(itemId: string): void {
    this.wcmService.getElementsOfAuthoringTemplates(itemId)
      .subscribe((res: any) => {
      // console.info(`elements: ${JSON.stringify(res)}`);
        const responseJSON: any = res;
        const entry = responseJSON.feed?.entry;
        // const total = responseJSON.feed?.total;
        if (entry) {
          //      if(this.isProMode) {
          //        this._snackBar.open(`从选择的模板找到${entry.length}个元素`, 'X', {
          //          duration: 3000
          //        });
          //      }
          const items: any = entry.map((item:any) => {
            const { type, name } = item;
            const title = item.title?.value;
            return {
              title,
              type,
              name,
              value: `element:${name.trim()}`,
              viewValue: `${name} | ${translateType(type)} | ${title}`,
            };
          });
          // the host that current elements belong to.
          this.currentATFields = [propertyFields, {
            name: '元素',
            items,
          }];
        } else {
        // if(this.isProMode) {
          this._snackBar.open('获取文章元素失败, 请稍候重试', 'X', {
            duration: 3000,
          });
        }
      });

    // reset the field mapping.
    //  this.mapFormGroup.patchValue({
    //    titleField: '',
    //    contentField: '',
    //  });
    // no need to reset contentGroup list, since it's hidden
  }

  isCanAdd(item): boolean {
    const isTypeOK = [
      'text',
      'TextComponent',
      'ShortTextComponent',
      'ImageComponent',
      'FileComponent',
      'RichTextComponent',
    ].includes(item.type);
    const isAlreadyAdded = this.formMap.value?.body?.indexOf(item.value) > -1;

    return isTypeOK && !isAlreadyAdded;
  }

  // TODO: implemented by child component
  async save() {
    const { atId } = this;
    const { atConfigId } = this;
    const { appShareConfigId } = this.config; // eslint-disable-line @typescript-eslint/no-unused-vars
    const WeiBoConfig = this.formData.value;
    let payload = null;
    payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
              WeiBo: [
                WeiBoConfig,
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

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    // this.formData.value
    this._snackBar.open('创建配置成功', 'X', {
      duration: 3000,
    });
  }

  previewContents(contents: ContentModel[]) {
    // event.stopPropagation();
    LogUtil.debug('showing preview');
    this.previewItems = contents;
  }

  refershPreview() {
    const tmp = this.previewItems;
    this.previewItems = null;
    setTimeout(() => {
      this.previewItems = tmp;
    }, 5);
  }

  translateElement(str) {
    switch (str) {
      case 'property:name':
        return 'property:name|String|属性:名称';
      case 'property:title':
        return 'property:name|String|属性:标题';
      default: {
        const a = 1; // eslint-disable-line @typescript-eslint/no-unused-vars
      }
    }

    const elements = this.currentATFields[1]?.items;
    if (!elements) {
      return str;
    }
    const i = elements.findIndex((item) => `element:${item.name}` === str);
    if (i < 0) {
      return str;
    }
    return elements[i].viewValue;
  }

  getPrioritySummaryString(arr) {
    return arr.map((item) => this.getI18n(item));
  }
}
