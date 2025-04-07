/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import {
  Component,
  OnInit,
  Injector,
  InjectionToken,
  Inject,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { customAlphabet } from 'nanoid';
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
import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort, SortDirection, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';

import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, paginateModelAppconfig,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-appconfig-list',
  templateUrl: './appconfig-list.component.html',
  styleUrls: [],
})

export class AppconfigListComponent extends CommonParent implements OnInit { // eslint-disable-line import/prefer-default-export
  @Input() isOrphan: boolean = false;

  @Input() isSingleSelect: boolean = false;

  @Output() appconfigSelect = new EventEmitter<APPConfigModel>();

  @Input() limitSMPTypeTo: string = '';

  selection = new SelectionModel<APPConfigModel>(true, []);

  displayedColumnsSearch: string[] = ['select', 'configName', 'smpType', 'isEnabled'];

  displayedColumnsSearchSingle: string[] = ['configName', 'smpType', 'isEnabled'];

  formData: FormGroup;

  fb: FormBuilder;

  paginateArg: paginateModelAppconfig = {
    page: 0,
    pagesize: 5,
    total: 0,
    queryTxt: '',
    sort: 'updated',
    order: 'desc',
    isEnabled: 'all',
  };

  dataSourceSearch = new MatTableDataSource<APPConfigModel>([]);

  @ViewChild('tableSearch') tableSearch!: MatTable<any>;

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

  // for single selection usage
  selected!: APPConfigModel;

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

  ngOnInit(): void {
    customizePaginatorTxt(this.matPaginatorIntl);
    this.searchItem();
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

  updateDS(newVal: APPConfigModel[]) {
    this.dataSourceSearch.data = newVal;
    this.dataSourceSearch!.paginator = this.paginatorSearch;
    this.dataSourceSearch!.sort = this.sortSearch;
  }

  reRenderTable() {
    const ori = this.dataSourceSearch.data.concat();
    this.updateDS([]);
    this.updateDS(ori);
  }

  toUpdateAPPConfig(row: APPConfigModel) {
    this.router.navigate(['/appconfig'], { queryParams: row });
  }

  deleteConfigs(rows: APPConfigModel[]) {
    const ids: string[] = rows.map((item) => item.configId);
    LogUtil.info(`delete ${JSON.stringify(ids)}`);
    // TODO: add a confirm dialog
    // TODO: need to check dependant of those appconfigs. e.g. smpconfig
    const action = '删除';
    this.wcmService.deleteAPPConfigs(ids)
      .subscribe((res: any) => {
        LogUtil.debug(`deleteAPPConfigs config result: ${JSON.stringify(res)}`);
        // const responseJSON: any = res;
        if (res.status === 200) {
        // toggle succeed
          _.pullAll(this.dataSourceSearch.data, rows);
          this.reRenderTable();
          this.selection.clear();
          this._snackBar.open(`${action}成功`, 'X', {
            duration: 3000,
          });
        } else {
          this._snackBar.open(`${action}失败`, 'X', {
            duration: 3000,
          });
        }
      });
  }

  async toggleEnable(row: APPConfigModel): Promise<boolean> {
    const { configId } = row;
    const currentStatus = row.isEnabled;
    const targetStatus = !currentStatus;
    LogUtil.debug(`toggleEnable- current status: ${currentStatus}, target status: ${targetStatus}, configId: ${configId}`);
    const data = { ids: [configId], targetStatus };
    return new Promise((resolve) => {
      this.wcmService.enableAPPConfig(data).subscribe((res: any) => {
        LogUtil.debug(`${targetStatus ? 'enable' : 'disable'} app config result: ${JSON.stringify(res)}`);
        if (res.status === 200) {
          // toggle succeed
          resolve(true);
          // update the background-color
          row.isEnabled = targetStatus; // eslint-disable-line no-param-reassign
        } else {
          // re-render to sync the wrong UI with the current realy data.
          this.reRenderTable();
          switch (res.errorCode) {
            case 'ERR_NOT_FOUND':
              this._snackBar.open('找不到该社交媒体配置', 'X', {
                duration: 3000,
              });
              break;
            case 'ERR_INVALID_TOKEN':
            case 'ERR_EXPIRED_TOKEN': {
              const { smpType, appKey, redirectURL } = row;
              this.wcmService.doAuthorize(smpType, configId, appKey, redirectURL);
              break;
            }
            default:
              this._snackBar.open('服务器内部错误', 'X', {
                duration: 3000,
              });
          }
          resolve(false);
        }
      });
    });
  }

  onRowClick(row: APPConfigModel): any {
    if (this.isSingleSelect) {
      // TODO: remove always false when facebook accessToken is ready.
      // if (false && !row.isEnabled) {
      if (!row.isEnabled) {
        this._snackBar.open('改配置还未激活, 不能选取.', 'X', {
          duration: 3000,
        });
        return false;
      }
      if (this.limitSMPTypeTo && row.smpType !== this.limitSMPTypeTo) {
        return this._snackBar.open(`只能选(${this.getI18n(this.limitSMPTypeTo)})社交媒体密钥配置`, 'X', {
          duration: 3000,
        });
      }
      return this.onSelectionChange(row);
    }
    return null;
  }

  searchItem(): void {
    this.wcmService.getAppconfigs(this.paginateArg)
      .subscribe((res: any) => {
      // console.info(`search: ${JSON.stringify(res)}`);
      // const responseJSON: any = JSON.parse(res);
        const total = res.headers?.get('X-Total-Count');
        const content = res.body?.content;
        if (content) {
          this.updateDS(content);
          // TODO: platform is missed from backend
          this.paginateArg.total = total;
        } else {
          this._snackBar.open('返回社交媒体密钥配置失败', 'X', {
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
  checkboxLabel(row?: APPConfigModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  onSelectionChange(row: APPConfigModel): void {
    this.appconfigSelect.emit(row);
    this.selected = row;
  }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    LogUtil.debug('in printEnv');
  }
}
