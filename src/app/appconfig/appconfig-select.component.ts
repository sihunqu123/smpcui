/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Component,
  OnInit,
  Inject,
  AfterViewInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { customAlphabet } from 'nanoid';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder, FormControl, FormGroup, Validators,
} from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { WcmService } from '../wcm.service';
import { APPConfigModel } from '../../model/index';
import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'appconfig-select',
  templateUrl: './appconfig-select.component.html',
  styleUrls: ['./appconfig-select.component.scss'],
})
export class AppconfigSelectComponent { // eslint-disable-line import/prefer-default-export
  fb: FormBuilder;

  @Output() selectEvent = new EventEmitter<any>();

  constructor(
    fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private wcmService: WcmService,
  ) {
    this.fb = fb;
    // TODO: un-comment-out this line
    // this.searchItem();
  }

  // ngOnInit(): void {
  // }

  /**
   * a testOnly function
   */
  printEnv(): void {
    this._snackBar.open('创建应用配置成功', 'X', {
      duration: 3000,
    });
  }

  displayedColumnsSearch: string[] = ['configName', 'smpType', 'redirectURL'];

  dataSourceSearch = new MatTableDataSource<APPConfigModel>([]);

  appconfigName4Search: string = '';

  selectedItem?: APPConfigModel;

  onSearchTxtChange(e: any): any {
    const queryTxt: string = e.target?.value;
    LogUtil.debug(`onSearchTxtChange: ${queryTxt}`);
    if (queryTxt && queryTxt.length > 1) {
      this.searchItem({ queryTxt });
    }
  }

  onSelectionChange(row: any): any {
    this.selectedItem = row;
    // tell it's parent
    this.selectEvent.emit(row);
  }

  searchItem(data?: any): void {
    this.wcmService.getAppconfigs(data)
      .subscribe((res: any) => {
        LogUtil.debug(`search: ${JSON.stringify(res)}`);
        // typesOfShoesRecent = [];
        // const responseJSON: any = JSON.parse(res);
        // const responseJSON: any = res;
        ///     const entry = responseJSON.feed?.entry;
        ///     if(entry) {
        ///     // { value: 'property:name', viewValue:'name' },
        ///       const items: any = entry.map((item:any) => {
        ///         const { id, title, updated, name } = item;
        ///         return {
        ///           itemId: id.split(':')[1],
        ///           title: title?.value,
        ///           updated,
        ///           name,
        ///         };
        ///       }).filter((item: any) => !this.data.addedIDs.includes(item.itemId));
        ///
        ///       this.searchedItems = items;
        ///       this.dataSourceSearch.data = items;
        ///       this.dataSourceSearch!.sort = this.sortSearch;
        ///     }
      });
  }
}
