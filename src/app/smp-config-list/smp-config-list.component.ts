/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
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

import { generateNanoid, customizePaginatorTxt } from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, SMPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, paginateModelAppconfig, EnableFailedItem,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-smp-config-list',
  templateUrl: './smp-config-list.component.html',
  styleUrls: ['./smp-config-list.component.scss'],
})
export class SmpConfigListComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  selection = new SelectionModel<SMPConfigModel>(true, []);

  displayedColumnsSearch: string[] = ['select', 'title', 'appConfigName', 'smpType', 'isEnabled'];

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

  dataSourceSearch = new MatTableDataSource<SMPConfigModel>([]);

  @ViewChild('tableSearch') tableSearch!: MatTable<any>;

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

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

  ngAfterViewInit() {
    //  this.dataSourceSearch!.paginator = this.paginatorSearch;
    //  this.dataSourceSearch!.sort = this.sortSearch;

  }

  ngOnInit(): void {
    customizePaginatorTxt(this.matPaginatorIntl);
    this.searchItem();
  }

  updateDS(newVal: SMPConfigModel[]) {
    this.dataSourceSearch.data = newVal;
    this.dataSourceSearch!.paginator = this.paginatorSearch;
    this.dataSourceSearch!.sort = this.sortSearch;
  }

  reRenderTable() {
    const ori = this.dataSourceSearch.data.concat();
    this.updateDS([]);
    this.updateDS(ori);
  }

  toUpdateConfig(row: SMPConfigModel) {
    this.router.navigate(['/smp-config'], { queryParams: row });
  }

  deleteConfigs(rows: SMPConfigModel[]) {
    const ids: string[] = rows.map((item) => item.id);
    console.info(`delete ${JSON.stringify(ids)}`);
    // TODO: add a confirm dialog
    const action = '删除';
    this.wcmService.deleteSMPConfigs(ids)
      .subscribe((res: any) => {
        if (res?.status == 200) {
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

  async toggleEnable(row: SMPConfigModel): Promise<any> {
    const configId = row.id;
    const currentStatus = row.isEnabled;
    const targetStatus = !currentStatus;
    console.info(`toggleEnable- current status: ${currentStatus}, target status: ${targetStatus}, configId: ${configId}`);
    const action = targetStatus ? '启用' : '禁用';

    try {
      const failedItem: EnableFailedItem[] = await this.toggleEnableReq(configId, targetStatus, 'smpconfig');
      if (failedItem.length === 0) {
        // change the row looks when succeed
        this.dataSourceSearch.data.filter((item) => item.id === configId)[0].isEnabled = targetStatus;
        return this._snackBar.open(`${action}成功`, 'X', {
          duration: 3000,
        });
      }
      const msg = failedItem.map((item) => ({ reason: item.reason })).join(',');
      this._snackBar.open(`${action}失败: ${msg}`, 'X', {
        duration: 3000,
      });
    } catch (e) {
      this._snackBar.open(e.message, 'X', {
        duration: 3000,
      });
    }

    // revert change when failed
    return this.reRenderTable();
  }

  async searchItem(): Promise<any> {
    this.wcmService.getSMPConfigs(this.paginateArg).subscribe((res: any) => {
      // console.info(`search: ${JSON.stringify(res)}`);
      // const responseJSON: any = JSON.parse(res);
      const total = res.headers?.get('X-Total-Count');
      const content = res.body?.content;
      if (content) {
        const appconfigIds: string[] = _.uniq(content.map((item) => item.appConfigId));

        if (appconfigIds.length === 0) {
          this.updateDS(content);
          this.paginateArg.total = total;
          return;
        }

        // TODO: what if the appconfig of smpconfig is disabled?????
        this.wcmService.getGivenAppconfigs(appconfigIds).subscribe((response: any) => {
          const appconfigs = response.content;
          content.forEach((row) => {
            const matchedAppconfig = appconfigs.filter((appconfig) => appconfig.configId === row.appConfigId);
            if (matchedAppconfig.length === 1) {
              row.appconfig = matchedAppconfig[0];
            } else {
              console.error(`no matched appconfig returned for ${row.appConfigId}`);
            }
          });
          this.updateDS(content);
          this.paginateArg.total = total;
        });
      } else {
        this._snackBar.open('获取社交媒体自动推送配置失败', 'X', {
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
    console.info(this.paginateArg);
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
  checkboxLabel(row?: SMPConfigModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  printEnv(): void {
    const _this = this;
    console.info('in printEnv');
  }
}
