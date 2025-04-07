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

import { CommonParent } from '../util';

import {
  getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { ContentSelectComponent } from '../content-select/content-select.component';
import { ContentPreviewDialogComponent } from '../content-preview/content-preview-dialog.component';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToShareModel, ToPreviewModel,
} from '../../model/index';

const emptyArr = [];
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-smpshare',
  templateUrl: './smpshare.component.html',
  styleUrls: [],
})
export class SmpshareComponent extends CommonParent implements OnInit, AfterViewInit { // eslint-disable-line import/prefer-default-export
  @ViewChild(ContentSelectComponent)
  private contentSelectComponent!: ContentSelectComponent;

  authoringTemplates: AuthoringTemplateModel[] = [];

  @ViewChild('paginatorShare', { read: MatPaginator }) paginatorShare!: MatPaginator;

  // @ViewChild(MatSort) sortShare!: MatSort;
  @ViewChild('sortShare', { read: MatSort }) sortShare!: MatSort;

  isProMode: boolean = false;

  testData = {
    previewItems: [{
      itemId: '8c79c9c8-5ee8-413f-9d39-ca652bac20f6', title: '暴风视频预警', updated: '2021-11-05 00:39:20', name: 'weibo-video-0',
    }],
    atMap: {
      atId: '3474899a-1440-4850-9df2-da4197fef793',
      defaultATConfigId: 'P94X5VGZO0F8aQa_YikJU',
      atConfigs: [{
        atConfigId: 'P94X5VGZO0F8aQa_YikJU',
        atConfigName: '新建模板配置',
        Facebook: [{
          appShareConfigId: 'SG1CpaQpAbtGtPBkhM5WK', appConfigId: 'DnXdctwpjSRNE8TueZuvE', isShare: true, map: { title: 'property:title', referFromLink: 'element:linkFiled', body: ['property:name', 'property:title', 'element:contentField', 'element:videoField', 'element:videoCoverField', 'element:videoTitleField'] },
        }],
      }],
    },
    atDetail: {
      itemId: '3474899a-1440-4850-9df2-da4197fef793', title: '视频模板', updated: 'Fri, 05 Nov 2021 08:36:15.119Z', name: 'at-weibo-video',
    },
  };

  formData: FormGroup;

  formAPP: FormGroup;

  fb: FormBuilder;

  stepperOrientation: Observable<StepperOrientation>;

  formAT: FormGroup;

  formMap: FormGroup;

  formContent: FormGroup;

  fetchedATId: string = '';

  currentATFields : any[] = [];

  displayedColumnsATResult: string[] = ['select', 'atName', 'atTitle', 'atConfigName', 'contentName', 'contentTitle', 'contentUpdated'];

  displayedColumnsResult: string[] = ['select', 'atConfigName', 'contentName', 'contentTitle', 'contentUpdated'];

  dataSource = new MatTableDataSource<ToShareModel>([]);

  selection = new SelectionModel<ToShareModel>(true, []);

  availableATs: string[] = [];

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    injector: Injector,
  ) {
    super(injector);

    this.fb = fb;
    this.formAPP = this.fb.group({
      // TODO: remove this initial value
      appconfig: [null, [Validators.required]],
    });
    this.formAT = this.fb.group({
      authoringTemplate: ['', Validators.required],
    });
    this.formMap = this.fb.group({
      mapping: [{
        titleField: '',
        contentField: '',
      }, Validators.required],
    });

    this.formMap.valueChanges.subscribe((val) => {
      LogUtil.debug(`formMap valuesChanged: ${JSON.stringify(val)}`);
      // this.contentSelectComponent.removeAddedItemsFromDataSourceContent();
    });
    this.formContent = this.fb.group({
      val: [[], Validators.required],
    });
    this.stepperOrientation = breakpointObserver.observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

    this.formData = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      smpType: ['', Validators.required],
      appKey: ['', Validators.maxLength(100)],
      appSecret: ['', Validators.maxLength(100)],
      redirectURL: ['', Validators.maxLength(200)],
      authoringTemplates: [this.authoringTemplates, Validators.maxLength(1000)],
      isEnabled: [true, Validators.required],
    });
  }

  ngAfterViewInit() {
    this.dataSource!.paginator = this.paginatorShare;
    this.dataSource!.sort = this.sortShare;
    //  this.dataSource.sortingDataAccessor = (item, property) => {
    //    switch (property) {
    //      case 'titleField':
    //        return `${item.titleField} - ${item.contentField}`;
    //      case 'contentName':
    //        return item.item[0].name;
    //      case 'contentTitle':
    //        return item.item[0].title;
    //      case 'contentUpdated':
    //        return item.item[0].updated;
    //      default:
    //        // @ts-ignore: Unreachable code error
    //        // @ts-ignore
    //        return item[property];
    //    }
    //  };
  }

  async ngOnInit(): Promise<any> {
    await this.initComponent();

    // when default AT is not set, then only promode is available.
    if (!this.effectivePreference?.defaultAT) {
      this.isProMode = true;
    }
    this.availableATs = this.effectivePreference?.atMaps?.filter((atMap) => atMap.atConfigs?.length > 0).map((atMap) => atMap.atId);
  }

  updateDS(newVal: any) {
    this.dataSource.data = newVal;
    // renderRows()
    this.dataSource!.paginator = this.paginatorShare;
    this.dataSource!.sort = this.sortShare;
    this.selection.clear();
    // this.contentSelectComponent.removeAddedItemsFromDataSourceContent();
  }

  deleteSelection() {
    this.updateDS(this.dataSource.data.filter((item: any) => !this.selection.selected.includes(item)));
    this.selection.clear();
  }

  onAppconfigSelect(row: APPConfigModel): void {
    LogUtil.debug(`onAppconfigSelect: ${JSON.stringify(row)}`);
    this.formAPP.patchValue({
      appconfig: row,
    });
  }

  onATSelect(row: AuthoringTemplateModel): any {
    this.formAT.patchValue({
      authoringTemplate: row,
    });
    // console.info(`onAtSelectionChange:  row: ${JSON.stringify(row)}`);

    // no need to reset contentGroup list, since it's hidden
  }

  // buildToBeShareModel(content: ContentModel): ToShareModel {
  //  return {
  //    authoringTemplateId: this.formAT.value.authoringTemplate.itemId,
  //    atName: this.formAT.value.authoringTemplate.name,
  //    atTitle: this.formAT.value.authoringTemplate.title,
  //    mediaType: this.formAT.value.mediaType,
  //    updated: this.formAT.value.authoringTemplate.updated,
  //    titleField: this.formMap.value.mapping.titleField,
  //    linkURL: this.formMap.value.mapping.linkURL,
  //    imageFields: this.formMap.value.mapping.imageFields,
  //    videoField: this.formMap.value.mapping.videoField,
  //    videoCoverField: this.formMap.value.mapping.videoCoverField,
  //    videoTitleField: this.formMap.value.mapping.videoTitleField,
  //    contentField: this.formMap.value.mapping.contentField,
  //    item: [content],
  //  };
  // }

  /**
   * add given contents into to-share-list
   */
  // addContentSelection(contentList: ContentModel[]): void {
  //  console.info(`addContentSelection`);
  //  const toAddList: ToBeShareModel[] = contentList.map((item: ContentModel) => this.buildToBeShareModel(item));
  //
  //  this.updateDS(this.dataSource.data.concat(toAddList));
  //  this._snackBar.open(`成功添加${contentList.length}个内容`, 'X', {
  //    duration: 3000
  //  });
  // }

  addContentToShareList(contentList: ToShareModel[]): void {
    // const toAddList: ToBeShareModel[] = contentList.map((item: ContentModel) => this.buildToBeShareModel(item));

    this.updateDS(this.dataSource.data.concat(contentList));
    this._snackBar.open(`成功添加${contentList.length}个内容`, 'X', {
      duration: 3000,
    });
  }

  lastExcludedItems: ToShareModel[] = emptyArr;

  getExcludedItems(): ToShareModel[] {
    // TODO implement the getExcludedItems method.
    //  let retVal: ToBeShareModel[] = emptyArr;
    //  if(this.formAT.value.authoringTemplate.itemId && this.formMap.value.mapping?.titleField && this.formMap.value.mapping?.contentField) {
    //    retVal = this.dataSource.data.filter((element: ToBeShareModel) =>
    //      element.authoringTemplateId === this.formAT.value.authoringTemplate.itemId
    //      && element.titleField === this.formMap.value.mapping?.titleField
    //      && element.contentField === this.formMap.value.mapping?.contentField
    //    );
    //  }
    //  if(!_.isEqual(retVal, this.lastExcludedItems)) this.lastExcludedItems = retVal;
    return this.lastExcludedItems;
  }

  onChildPreview(contents: ContentModel[]): void {
    const atMapOfThisATId = this.effectivePreference.atMaps.filter((atMap) => atMap.atId === this.formAT.value.authoringTemplate.itemId)[0];
    const atDetail = this.effectivePreference.atMapsDetail[this.formAT.value.authoringTemplate?.itemId];
    return this.previewContents(contents, atMapOfThisATId, atDetail);
  }

  previewContents(items: ContentModel[], atMap, atDetail): void {
    // console.info(`preview: ${JSON.stringify(items)}, atMap: ${JSON.stringify(atMap)}, atDetail: ${JSON.stringify(atDetail)}`);

    const previewData = {
      previewItems: items,
      atMap,
      atDetail,
      isNeedToAdd: true,
    };
    const dialogRef = this.dialog.open(ContentPreviewDialogComponent, {
      backdropClass: 'preview-dialog-backdropClass',
      panelClass: 'preview-dialog-panel',
      // TODO: replace
      data: previewData,
    });

    // console.info(`preview data: ${JSON.stringify(previewData)}`);

    dialogRef.afterClosed().subscribe((result) => {
      // console.log(`Dialog result: ${JSON.stringify(result)}`);
      if (result?.length > 0) {
        this.addContentToShareList(result);
      }
    });
  }

  onIsProModeChange() {
    if (!this.isProMode) {
      if (!this.formAT.value.authoringTemplate) {
        this.onATSelect(this.effectivePreference.atMapsDetail[this.effectivePreference?.defaultAT]);
      }
    }
  }

  /**
   * a testOnly function
   */
  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    const aa = this.formData; // eslint-disable-line @typescript-eslint/no-unused-vars
    this._snackBar.open('创建配置成功', 'X', {
      duration: 3000,
    });

    LogUtil.debug(`formData: ${JSON.stringify(this.currentATFields)}`);
    LogUtil.debug(`formData: ${this.formData.value}`);
    // console.info(`formData.v: ${this.formData.value}`);
  }

  onCancel(): void {
    LogUtil.debug(`formData: ${this.formData.value}`);
  }

  onSubmit(): void {
    LogUtil.debug('submit');
    //  const shareList = this.dataSource.data.map((toShareModel: ToShareModel) => {
    //    const { atDetail, item, atConfig }  = toShareModel;
    //    const atId = atDetail.itemId;
    //    const itemId = item.itemId;
    //    return {
    //      atId,
    //      atConfig,
    //      contentIds: [ itemId ],
    //    };
    //  });

    // gather same config shareItem into an array

    // const _this = this;
    const dataList = _.cloneDeep(this.dataSource.data);
    const shareList = [];
    dataList.forEach((toShareModel: ToShareModel) => {
      const { atDetail, item, atConfig } = toShareModel;
      const { itemId } = item;
      const sameConfigShareItem = shareList.find((shareItem) => shareItem.atConfig?.atConfigId && shareItem.atConfig?.atConfigId === atConfig?.atConfigId);
      if (sameConfigShareItem) {
        sameConfigShareItem.contentIds.push(itemId);
      } else {
        const atId = atDetail.itemId;
        const newShareItem = {
          atId,
          atConfig,
          contentIds: [itemId],
        };
        shareList.push(newShareItem);
      }
    });

    const payload = {
      shareList,
    };
    LogUtil.debug(`share submit ${JSON.stringify(payload, null, 2)}`);

    this.wcmService.shareContents(payload)
      .subscribe((res: any) => {
        LogUtil.debug(`share result: ${JSON.stringify(res)}`);
        const responseJSON: any = res;
        if (responseJSON.status === 200) {
          this._snackBar.open('分享成功!', 'X', {
            duration: 3000,
          });
        } else {
          this._snackBar.open(`分享失败: ${responseJSON.message}`, 'X', {
            duration: 5000,
          });
        }
      });

    this._snackBar.open('分享处理中... 下载和上传内容可能会花较长时间, 请耐心等待!', 'X', {
      duration: 5000,
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    // debugger;
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ToShareModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }
}

// SmpshareComponent.prototype.getI18n = getI18n;
