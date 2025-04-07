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
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
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

import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, SortDirection, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';
import {
  getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { ContentSelectComponent } from '../content-select/content-select.component';
import { ContentPreviewDialogComponent } from '../content-preview/content-preview-dialog.component';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToShareModel, ToPreviewModel, paginateModelAppconfig, paginateModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-publicshare',
  templateUrl: './publicshare.component.html',
  styleUrls: [],
})
export class PublicshareComponent extends CommonParent implements OnInit { // eslint-disable-line import/prefer-default-export
  @Input() isOrphan: boolean = false;

  @Input() isSingleSelect: boolean = false;
  // @Output() appconfigSelect = new EventEmitter<ContentModel>();

  @Input() limitSMPTypeTo: string = '';

  selection = new SelectionModel<ContentModel>(true, []);

  displayedColumnsSearch: string[] = ['select', 'title', 'name', 'updated', 'author'];

  formData: FormGroup;

  fb: FormBuilder;

  paginateArg: paginateModel = {
    page: 0,
    pagesize: 5,
    total: 0,
    queryTxt: '',
    sort: 'updated',
    order: 'desc',
  };

  dataSourceSearch = new MatTableDataSource<ContentModel>([]);

  @ViewChild('tableSearch') tableSearch!: MatTable<any>;

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

  // for single selection usage
  selected!: ContentModel;

  availableATs: string[] = [];

  constructor(
    public router: Router,
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

  // ngAfterViewInit() {
  //  //  this.dataSourceSearch!.paginator = this.paginatorSearch;
  //  //  this.dataSourceSearch!.sort = this.sortSearch;
  //
  // }

  async ngOnInit(): Promise<any> {
    customizePaginatorTxt(this.matPaginatorIntl);
    this.searchItem();

    await this.initComponent();

    this.availableATs = this.effectivePreference?.atMaps?.filter((atMap) => atMap.atConfigs?.length > 0).map((atMap) => atMap.atId);
  }

  // ngOnChanges(changes: SimpleChanges) {
  //  // changes.prop contains the old and the new value...
  //  if (changes.limitSMPTypeTo && changes.limitSMPTypeTo.currentValue) {
  //    //    this.dataSourceSearch?.data?.map(item => (item.smpType === this.limitSMPTypeTo ? {
  //    //      ...item,
  //    //      disabled: true,
  //    //    } : item));
  //  }
  // }

  updateDS(newVal: ContentModel[]) {
    this.dataSourceSearch.data = newVal;
    this.dataSourceSearch!.paginator = this.paginatorSearch;
    this.dataSourceSearch!.sort = this.sortSearch;
  }

  reRenderTable() {
    const ori = this.dataSourceSearch.data.concat();
    this.updateDS([]);
    this.updateDS(ori);
  }

  // rejectItems(newVal: ContentModel[]) {
  //
  // }

  async previewItems(newVal: ContentModel[]) {
    const contentToPreview = newVal[0];
    const { itemId } = contentToPreview;
    const contentDetail: any = await new Promise((resolve, reject) => {
      this.wcmService.getDetailsOfContent(itemId).subscribe((res: any) => {
        // console.info(`search: ${JSON.stringify(res)}`);
        // typesOfShoesRecent = [];
        // const responseJSON: any = JSON.parse(res);
        const responseJSON: any = res;
        const { entry } = responseJSON;
        if (entry) {
          const {
            id, title, name, updated, summary, content, link,
          } = entry;

          const atHref = link.filter((item) => item.rel === 'content-template')[0].href;
          const atId = atHref.substr(atHref.lastIndexOf('/') + 1);

          // the structor of content
          /*
    "content": {
      "type": "application/vnd.ibm.wcm+xml",
      "content": {
        "elements": {
          "element": [
            {
              "name": "  Body",
              "title": {
                "lang": "en",
                "value": "文章"
              },
              "type": "RichTextComponent",
              "data": {
                "type": "text/html",
                "value": "<p>暴风预警,&nbsp;请做好<strong>防护</strong></p>\n\n<div id=\"gtx-trans\" style=\"position: absolute; left: 128px; top: -6px;\">\n<div class=\"gtx-trans-icon\">&nbsp;</div>\n</div>\n"
              }
            }
          ]
        }
      }
    }
           */
          const elements: any[] = content?.content?.elements.element;
          const retVal = {
            properties: {
              id,
              title,
              summary,
              name,
              atId,
              updated: toChineseDateFormat(updated),
            },
            elements,
          };

          resolve(retVal);
        } else {
          reject(new Error('failed to fetch content details'));
          this._snackBar.open('没有得到内容', 'X', {
            duration: 3000,
          });
        }
      });
    });

    const atId = contentDetail?.properties?.atId;
    const contents = [contentToPreview];
    const atMaps = this.effectivePreference.atMaps.filter((atMap) => atMap.atId === atId);
    if (atMaps.length === 0) {
      this._snackBar.open('该内容的模板还未有任何分享配置, 请先为其创建分享配置!', 'X', {
        duration: 3000,
      });
      return;
    }
    const atMap = atMaps[0];
    const atDetail = this.effectivePreference.atMapsDetail[atId];
    this.previewContents(contents, atMap, atDetail);
  }

  previewContents(items: ContentModel[], atMap, atDetail): void {
    // console.info(`preview: ${JSON.stringify(items)}, atMap: ${JSON.stringify(atMap)}, atDetail: ${JSON.stringify(atDetail)}`);

    const previewData = {
      previewItems: items,
      atMap,
      atDetail,
      isNeedToAdd: true,
      previewActionMode: 'review',
    };
    const dialogRef = this.dialog.open(ContentPreviewDialogComponent, {
      backdropClass: 'preview-dialog-backdropClass',
      panelClass: 'preview-dialog-panel',
      // TODO: replace
      data: previewData,
    });

    // console.info(`preview data: ${JSON.stringify(previewData)}`);

    dialogRef.afterClosed().subscribe((result) => {
      // refresh list in case user approve/reject some items
      setTimeout(():void => {
        LogUtil.debug('before setTimeout');
        return this.searchItem();
      }, 2000);
      // console.log(`Dialog result: ${JSON.stringify(result)}`);
      if (result?.length > 0) {
        // this.addContentToShareList(result);
        LogUtil.debug('doSharing...');
      }
    });
  }

  searchItem(): void {
    this.wcmService.getToApproveList(this.paginateArg)
      .subscribe((res: any) => {
      // console.info(`search: ${JSON.stringify(res)}`);
      // typesOfShoesRecent = [];
      // const responseJSON: any = JSON.parse(res);
        const responseJSON: any = res;
        const entry = responseJSON.feed?.entry;
        this.paginateArg.total = responseJSON.feed?.total;
        if (entry) {
          // { value: 'property:name', viewValue:'name' },
        // this._snackBar.open(`找到${this.paginateArg.total}个内容`, 'X', {
        //   duration: 3000
        // });
          const items: ContentModel[] = entry.map((item:any) => {
            const {
              id, title, updated, name, author,
            } = item;
            const authorVal = author ? author[0].name : '';
            return {
              itemId: id.split(':')[1],
              title: title?.value,
              updated: toChineseDateFormat(updated),
              name,
              author: authorVal,
            };
          });
          this.updateDS(items);
          this.selection.clear();
        } else {
          this.updateDS([]);
          this.selection.clear();
          this._snackBar.open('您没有待审核的内容', 'X', {
            duration: 3000,
          });
        }
      });
  }

  changeSort(sortInfo: Sort) : void {
    this.paginateArg.sort = sortInfo.active;
    this.paginateArg.order = sortInfo.direction;
    // reset to page 0 when order changed.
    this.paginateArg.page = 0;
    this.searchItem();
  }

  pageChange(page: PageEvent) :void {
    this.paginateArg.page = page.pageIndex;
    this.paginateArg.pagesize = page.pageSize;

    this.searchItem();
  }

  onSearchTxtChange(e: any) :void {
    const queryTxt: string = e.target?.value;
    // console.info(`onSearchTxtChange: ${keyword}`);
    if (queryTxt && queryTxt.length > 1) {
      // this.searchItem({ queryTxt });
      // reset to page 0 when queryTxt changed.
      this.paginateArg.page = 0;
      this.searchItem();
    }
    LogUtil.debug(this.paginateArg);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceSearch.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSourceSearch.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ContentModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  // onSelectionChange(row: ContentModel): void {
  //  this.appconfigSelect.emit(row);
  //  this.selected = row;
  // }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    LogUtil.debug('in printEnv');
  }
}
