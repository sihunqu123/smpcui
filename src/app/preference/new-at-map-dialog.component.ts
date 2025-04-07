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

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'new-at-map',
  templateUrl: './new-at-map-dialog.component.html',
  styleUrls: [],
})
export class NewATMapDialogComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  disabledItems: string[];

  selectedAT: AuthoringTemplateModel = null;

  title: string = '选择模板';

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    public dialogRef: MatDialogRef<NewATMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    injector: Injector,
  ) {
    super(injector);
    this.disabledItems = data.disabledItems;
    // console.info(`previewItems: ${JSON.stringify(this.previewItems)}`);
  }

  // ngOnInit(): void {
  // }

  onATSelect(row: AuthoringTemplateModel): void {
    this.selectedAT = row;
  }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    this._snackBar.open('创建配置成功', 'X', {
      duration: 3000,
    });
  }
}
