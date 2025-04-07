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
  getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'at-select',
  templateUrl: './at-select.component.html',
  styleUrls: [],
})
export class ATSelectComponent extends CommonParent implements OnInit, AfterViewInit { // eslint-disable-line import/prefer-default-export
  @Input() disabledItems: string[] = [];

  @Input() availableATs: string[] = [];

  @Output() selectEvent = new EventEmitter<AuthoringTemplateModel>();

  @ViewChild('paginatorSearch', { read: MatPaginator }) paginatorSearch!: MatPaginator;

  // @ViewChild('paginator') paginator?: MatPaginator;
  @ViewChild('sortSearch', { read: MatSort }) sortSearch!: MatSort;

  displayedColumnsSearch: string[] = ['title', 'name', 'updated'];

  dataSourceSearch = new MatTableDataSource<AuthoringTemplateModel>();

  contentNameForSearch: string = '';

  selected!: AuthoringTemplateModel;

  formData: FormGroup;

  fb: FormBuilder;

  // updateDS(newVal: any) {
  //  this.shareList = newVal;
  //  this.dataSource.data = this.shareList;
  //  this.dataSource!.paginator = this.paginatorSearch;
  //  this.dataSource!.sort = this.sortShare;
  //  this.removeAddedItemsFromDataSourceContent();
  // }

  paginateArg: paginateModel = {
    page: 0,
    pagesize: 5,
    total: 0,
    queryTxt: '',
    sort: 'updated',
    order: 'desc',
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

  ngOnInit(): void {
    // this.getRecentAuthoringTemplates();
    customizePaginatorTxt(this.matPaginatorIntl);

    const handler = this.handleSearchResult.bind(this);
    this.searchText$.pipe(
      debounceTime(2000),
      distinctUntilChanged(),
      switchMap((queryTxt): Observable<string> => this.searchItem(false)), // eslint-disable-line @typescript-eslint/no-unused-vars
    )
      .subscribe(handler);
  }

  ngAfterViewInit() {
    //  this.dataSource!.paginator = this.paginatorSearch;
    //  this.dataSource!.sort = this.sortShare;
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

    this.dataSourceSearch!.sort = this.sortSearch;
    this.searchItem();
    // 分頁切換時，重新取得資料
    //  this.paginatorSearch.page.subscribe((page: PageEvent) => {
    //    this.pageChange();
    //  });
  }

  pageChange(page: PageEvent) :void {
    this.paginateArg.page = page.pageIndex;
    this.paginateArg.pagesize = page.pageSize;

    this.searchItem();
  }

  atNameForSearch: string = '';

  changeSort(sortInfo: Sort) : void {
    this.paginateArg.sort = sortInfo.active;
    this.paginateArg.order = sortInfo.direction;
    // reset to page 0 when order changed.
    this.paginateArg.page = 0;
    this.searchItem();
  }

  // onSearchTxtChange(keyword: string): any {
  private searchText$ = new Subject<string>();

  onSearchTxtChange(e: any): any {
    const queryTxt: string = e.target?.value;
    //  if(queryTxt && queryTxt.length > 1) {
    // reset to page 0 when queryTxt changed.
    this.paginateArg.page = 0;
    this.searchText$.next(queryTxt);
    //  }
  }

  handleSearchResult(res: any) {
    // console.info(`search: ${JSON.stringify(res)}`);
    // typesOfShoesRecent = [];
    // const responseJSON: any = JSON.parse(res);
    const responseJSON: any = res;
    const entry = responseJSON.feed?.entry;
    this.paginateArg.total = responseJSON.feed?.total;
    if (entry) {
    // { value: 'property:name', viewValue:'name' },
      const items: any = entry.map((item:any) => {
        const {
          id, title, updated, name,
        } = item;
        const itemId = id.split(':')[1];
        return {
          itemId,
          title: title?.value,
          updated: toChineseDateFormat(updated),
          name,
          isDisabled: this.availableATs?.length > 0 && !this.availableATs.find((availableATId) => availableATId === itemId),
        };
      });

      this.dataSourceSearch.data = items;
      this.dataSourceSearch!.sort = this.sortSearch;
    }
  }

  searchItem(isAutoSubscribe = true): Observable<any> {
    const obs$ = this.wcmService.searchAuthoringTemplates(this.paginateArg);
    if (isAutoSubscribe) {
      const handler = this.handleSearchResult.bind(this);
      obs$.subscribe(handler);
    }
    return obs$;
  }

  onSelectionChange(row: AuthoringTemplateModel, isDisabled): void {
    if (isDisabled) {
      this._snackBar.open('该模板还没有任何配置! 请先配置后再使用该模板来分享.', 'X', {
        duration: 3000,
      });
    } else {
      // tell it's parent
      this.selectEvent.emit(row);
      this.selected = row;
    }
  }

  currentContentHost: string = '';

  // removeAddedItemsFromDataSourceContent(): void {
  //  if(this.mapFormGroup.value.titleField && this.mapFormGroup.value.contentField ) {
  //    this.dataSourceContent.data = this.contents.filter(({ itemId }) : boolean => {
  //      const isFound = this.shareList.find((shareItem: any) => {
  //          return shareItem.authoringTemplateId === this.currentContentHost
  //            && shareItem.titleField === this.mapFormGroup.value.titleField
  //            && shareItem.contentField === this.mapFormGroup.value.contentField
  //            && shareItem.item[0].itemId === itemId;
  //        }
  //      );
  //      return !isFound;
  //    });
  //  }
  // }

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
