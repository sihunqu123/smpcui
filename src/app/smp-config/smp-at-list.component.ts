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
  APPConfigModel, SMPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, paginateModelAppconfig, ATMapResultModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'smp-at-list',
  templateUrl: './smp-at-list.component.html',
  styleUrls: [],
})
export class SmpATListComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
// TODO: query smpATList right after atNames
  //
  @Input() id = '';

  @Input() isUpdate = false;

  @Input() isProMode = false;

  selection = new SelectionModel<ATMapResultModel>(true, []);

  displayedColumnsSearch: string[] = ['select', 'title', 'mediaType'];

  displayedColumnsATResult: string[] = ['select', 'title', 'name', 'updated', 'fieldMapping'];

  formData: FormGroup;

  fb: FormBuilder;

  // paginateArg: paginateModelAppconfig = {
  paginateArg: any = {
    page: 0,
    pagesize: 5,
    total: 0,
    sort: 'updated',
    order: 'desc',
  };

  dataSourceSearch = new MatTableDataSource<ATMapResultModel>([]);

  @ViewChild('tableSearch') tableSearch!: MatTable<any>;

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

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

  ngAfterViewInit() {
    //  this.dataSourceSearch!.paginator = this.paginatorSearch;
    //  this.dataSourceSearch!.sort = this.sortSearch;

  }

  ngOnInit(): void {
    customizePaginatorTxt(this.matPaginatorIntl);
    this.searchItem();
  }

  updateDS(newVal: ATMapResultModel[]) {
    this.dataSourceSearch.data = newVal;
    this.dataSourceSearch!.paginator = this.paginatorSearch;
    this.dataSourceSearch!.sort = this.sortSearch;
  }

  reRenderTable() {
    const ori = this.dataSourceSearch.data.concat();
    this.updateDS([]);
    this.updateDS(ori);
  }

  deleteConfigs(rows: ATMapResultModel[]) {
    //  const ids: string[]= rows.map((item) => item.id);
    //  console.info(`delete ${JSON.stringify(ids)}`);
    //  // TODO: add a confirm dialog
    //  const action = '删除';
    //  this.wcmService.deleteSMPConfigs(ids)
    //    .subscribe((res: any) => {
    //      if (res?.status == 200) {
    //        // toggle succeed
    //        _.pullAll(this.dataSourceSearch.data, rows);
    //        this.reRenderTable();
    //        this._snackBar.open(`${action}成功`, 'X', {
    //          duration: 3000
    //        });
    //      } else {
    //        this._snackBar.open(`${action}失败`, 'X', {
    //          duration: 3000
    //        });
    //      }
    //  });
  }

  searchItem(): void {
    this.wcmService.getSMPConfigs(this.paginateArg)
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
          this._snackBar.open('返回社交媒体自动推送配置', 'X', {
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
  checkboxLabel(row?: ATMapResultModel): string {
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
