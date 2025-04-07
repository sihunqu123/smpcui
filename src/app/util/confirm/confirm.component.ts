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
// import { CommonParent } from '..';

import { WcmService } from '../../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel,
} from '../../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html',
  styleUrls: [],
})
export class ConfirmComponent { // eslint-disable-line import/prefer-default-export
  title: string;

  content: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.content = data.content;
    this.title = data.title;
  }

  // ngOnInit(): void {
  // }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}
