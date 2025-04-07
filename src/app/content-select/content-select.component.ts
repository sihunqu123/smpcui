/* eslint-disable @typescript-eslint/no-unused-vars */
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
  getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToShareModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'content-select',
  templateUrl: './content-select.component.html',
  styleUrls: [],
})
export class ContentSelectComponent extends CommonParent implements OnInit, OnChanges, AfterViewInit { // eslint-disable-line import/prefer-default-export
  @Input() atId!: string;

  @Input() isNeedToAdd: boolean;

  @Input() fetchedATId!: string;

  @Output()fetchedATIdChange = new EventEmitter<string>();

  setfetchedId(val: string) :void {
    this.fetchedATIdChange.emit(val);
  }

  @Input() excludedItems!: ToShareModel[];

  @Output() addEvent = new EventEmitter<ContentModel[]>();

  @Output() previewEvent = new EventEmitter<ContentModel[]>();

  @ViewChild('tableSearch') tableSearch!: MatTable<any>;

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  // @ViewChild('paginator') paginator?: MatPaginator;
  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

  displayedColumnsSearch: string[] = ['select', 'title', 'name', 'updated', 'preview'];

  dataSourceSearch = new MatTableDataSource<ContentModel>();

  paginateArg: paginateModelChild = {
    parentId: '',
    page: 0,
    pagesize: 5,
    total: 0,
    queryTxt: '',
    sort: 'updated',
    order: 'desc',
  };

  btnTxt: string;

  formData: FormGroup;

  fb: FormBuilder;

  selection = new SelectionModel<ContentModel>(true, []);

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
    // this.searchItem({sort: 'updated', order: 'DESC'});
    this.formData = this.fb.group({
    });
  }

  ngAfterViewInit() {
    this.dataSourceSearch!.sort = this.sortSearch;
  }

  ngOnInit(): void {
    // this.getRecentAuthoringTemplates();
    this.btnTxt = this.isNeedToAdd ? '预览添加' : '预览';
  }

  lastExcludedItems: ToBeShareModel[] = [];

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.atId && changes.atId.currentValue) {
      // reset to page 0 when queryTxt changed.
      this.paginateArg.parentId = changes.atId.currentValue;
      this.paginateArg.queryTxt = '';
      this.paginateArg.page = 0;
      this.searchItem();
      // console.info(this.paginateArg);
    }
    //  if(changes.excludedItems) {
    //    console.info(`this.lastExcludedItems: ${this.lastExcludedItems}, changes.excludedItems.currentValue: ${changes.excludedItems.currentValue}, equal:${changes.excludedItems.currentValue ===  this.lastExcludedItems}`);
    //    this.lastExcludedItems = changes.excludedItems.currentValue;
    //    this.removeAddedItemsFromDataSourceContent();
    //  }
  }

  addSelection(selected: ContentModel[]): void {
    LogUtil.debug('addSelection');
    // tell it's parent
    this.addEvent.emit(selected);
    this.selection.clear();
  }

  previewContents(selected: ContentModel[]): void {
    // console.info(`previewContent`);
    // tell it's parent
    this.previewEvent.emit(selected);
  }

  changeSort(sortInfo: Sort) : void {
    this.paginateArg.sort = sortInfo.active;
    this.paginateArg.order = sortInfo.direction;
    // reset to page 0 when order changed.
    this.paginateArg.page = 0;
    this.searchItem();
  }

  onSearchTxtChange(e: any) :void {
    const queryTxt: string = e.target?.value;
    // console.info(`onSearchTxtChange: ${keyword}`);
    if (this.paginateArg.parentId && queryTxt && queryTxt.length > 1) {
      // this.searchItem({ queryTxt });
      // reset to page 0 when queryTxt changed.
      this.paginateArg.page = 0;
      this.searchItem();
    }
    LogUtil.debug(this.paginateArg);
  }

  searchItem(): void {
    const { parentId } = this.paginateArg;
    this.wcmService.getContentOfAuthoringTemplate({
      ...this.paginateArg,
      id: parentId,
    })
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
              id, title, updated, name,
            } = item;
            return {
              itemId: id.split(':')[1],
              title: title?.value,
              updated: toChineseDateFormat(updated),
              name,
            };
          });
          this.dataSourceSearch.data = items;
          this.dataSourceSearch!.sort = this.sortSearch;
          this.setfetchedId(parentId);
          // TODO: filter the result
          this.removeAddedItemsFromDataSourceContent();
          this.selection.clear();
        } else {
        // TODO: how to reset the currentATFields
          this.setfetchedId('');
          this._snackBar.open('没有从选择的模板找到对应的内容', 'X', {
            duration: 3000,
          });
        }
      });
  }

  removeAddedItemsFromDataSourceContent(): void { // eslint-disable-line class-methods-use-this
    //  this.dataSourceSearch.data.forEach((item: any) => {
    //    const { itemId } = item;
    //    if(this.excludedItems.findIndex((eItem) => eItem.item[0].itemId === itemId) >= 0) {
    //      item['disabled'] = true;
    //    } else if(item.hasOwnProperty('disabled')) {
    //      /* tslint:disable */
    //      delete item?.disabled /* tslint:enable */
    //    };
    //  });
    //  this.dataSourceSearch.data = this.dataSourceSearch.data.concat();
    //  this.tableSearch?.renderRows();
  }

  pageChange(page: PageEvent) :void {
    this.paginateArg.page = page.pageIndex;
    this.paginateArg.pagesize = page.pageSize;

    this.searchItem();
  }

  getEnabled(): ContentModel[] {
    return this.dataSourceSearch.data.filter((item) => !item.disabled);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.getEnabled().length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.getEnabled());
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ContentModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
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
  }
}
