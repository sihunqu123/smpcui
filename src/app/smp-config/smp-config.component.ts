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
} from '@angular/core';
import {
  RouterModule, Routes, Router, ActivatedRoute,
} from '@angular/router';
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

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';

import { WcmService } from '../wcm.service';
import { generateNanoid, customizePaginatorTxt } from '../../utils/utils';
import {
  APPConfigModel, SMPConfigModel, AuthoringTemplateModel, MappingModel, ATMapResultModel, EnableFailedItem,
} from '../../model/index';
import { ConfirmComponent } from '../util/confirm/confirm.component';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-smp-config',
  templateUrl: './smp-config.component.html',
  styleUrls: [],
})
export class SmpConfigComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  stepperOrientation: Observable<StepperOrientation>;

  isEnabled: boolean = false;

  isUpdate: boolean = false;

  // for at-map {
  isProMode: boolean = false;

  mapping: MappingModel = {
    titleField: '',
    contentField: '',
  };

  currentATFields: any[] = [];
  // }

  hideSecret: boolean = true;

  // floatLabel: FormControl = new FormControl('auto');

  displayedColumns: string[] = ['select', 'title', 'mediaType'];

  displayedColumnsATResult: string[] = ['select', 'title', 'name', 'updated', 'fieldMapping'];

  dataSource = new MatTableDataSource<ATMapResultModel>([]);

  selection = new SelectionModel<ATMapResultModel>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: ATMapResultModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  // syncDataSourceChildComponent() {
  updateDS(newVal: any) {
    this.dataSource.data = newVal;
    this.dataSource!.paginator = this.paginatorResult;
    this.dataSource!.sort = this.sortResult;
  }

  deleteSelection() {
    this.selection.clear();
    this.updateDS(this.dataSource.data.filter((item: any) => !this.selection.selected.includes(item)));
    this.selection.clear();
  }

  @ViewChild(MatPaginator) paginatorResult!: MatPaginator;

  @ViewChild(MatSort) sortResult!: MatSort;

  formData: FormGroup;

  formAT: FormGroup;

  formMap: FormGroup;

  fb: FormBuilder;

  lastSavedState: any = null;

  constructor(
    fb: FormBuilder,
    // private wcmService: WcmService,
    private route: ActivatedRoute,
    breakpointObserver: BreakpointObserver,
    injector: Injector,
  ) {
    super(injector);

    this.stepperOrientation = breakpointObserver.observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
    this.fb = fb;

    this.formData = this.fb.group({
      id: ['', [Validators.required, Validators.maxLength(32)]],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      // TODO: remove this initial value
      appconfig: [null, [Validators.required]],
      // isEnabled: [true, Validators.required],
    });

    this.formAT = this.fb.group({
      authoringTemplate: ['', Validators.required],
      mediaType: ['image', Validators.required],
    });
    this.formMap = this.fb.group({
      mapping: [{
        titleField: '',
        contentField: '',
      }, Validators.required],
    });

    this.route.queryParams.subscribe((params) => {
      console.log(params);
      if (params.id) {
        this.isUpdate = true;
        const {
          id, appConfigId, title, isEnabled, authoringTemplates,
        } = params;
        const appconfig = null; // TODO: get appconfig from id
        this.formData.setValue({ id, title, appconfig });
        this.isEnabled = params.isEnabled === 'true';
      } else {
        const id = generateNanoid();
        this.formData.setValue({ id, title: '', appconfig: null });
      }
    });
  }

  async ngOnInit(): Promise<any> {
    await this.initComponent();
  }

  ngAfterViewInit() {
    this.dataSource!.paginator = this.paginatorResult;
    this.dataSource!.sort = this.sortResult;
  }

  /**
   * a testOnly function
   */
  printEnv(): void {
    const aa = this.formData;
    this._snackBar.open('创建配置成功', 'X', {
      duration: 3000,
    });

    console.info(`formData: ${this.formData.value}`);
  }

  onCancel(): void {
    console.info(`formData: ${this.formData.value}`);
  }

  onAppconfigSelect(row: APPConfigModel): void {
    console.info(`onAppconfigSelect: ${JSON.stringify(row)}`);
    this.formData.patchValue({
      appconfig: row,
    });
  }

  onATSelect(row: AuthoringTemplateModel): any {
    this.formAT.patchValue({
      authoringTemplate: row,
    });
    console.info(`onAtSelectionChange:  row: ${JSON.stringify(row)}`);

    // reset the field mapping.
    this.formMap.patchValue({
      mapping: {
        titleField: '',
        contentField: '',
      },
    });
    // no need to reset contentGroup list, since it's hidden
  }

  isAlreadyAdded(): boolean {
    if (_.findIndex(this.dataSource?.data, {
      at: this.formAT.value.authoringTemplate,
      mapping: this.formMap.value?.mapping,
      mediaType: this.formAT.value.mediaType,
    }) >= 0) {
      return true;
    }
    return false;
  }

  addATMapping():void {
    const toAdd = {
      at: this.formAT.value.authoringTemplate,
      mapping: this.formMap.value?.mapping,
      mediaType: this.formAT.value.mediaType,
    };
    this.dataSource?.data.push(toAdd);
    this.updateDS(this.dataSource?.data);

    this._snackBar.open('添加成功!', 'X', {
      duration: 3000,
    });
  }

  onIsProModeChange() {
    if (!this.isProMode) {
      if (!this.formAT.value.authoringTemplate) { // auto select the image mode
        // this.onATSelect(this.effectivePreference.defaultATsDetailed.weibo_image);
        this.formAT.value.mediaType = 'image'; // default to image
      }
    }
  }

  changeATType(): void {
    //  switch (this.formAT.value.mediaType) {
    //    case 'video':
    //      this.onATSelect(this.effectivePreference.defaultATsDetailed.weibo_video);
    //      break;
    //    case 'image':
    //      // TODO: how to select the fixed image template?
    //      this.onATSelect(this.effectivePreference.defaultATsDetailed.weibo_image);
    //      break;
    //    default:
    //      this.onATSelect(this.effectivePreference.defaultATsDetailed.weibo_text);
    //  }
  }

  onSubmit(): void {
    console.info('submit');
    const { id, title, appconfig } = this.formData.value;
    const appConfigId = appconfig.configId;
    const data = { id, title, appConfigId };
    console.info(this.isUpdate ? 'update' : 'create' + ` smp config: ${JSON.stringify(data, null, 2)}`);

    if (this.isUpdate) {
      this.wcmService.updateSMPConfig(data).subscribe((res: any) => {
        console.info(`update smp config result: ${JSON.stringify(res)}`);

        if (res.status === 200) {
          this._snackBar.open('更新成功!', 'X', {
            duration: 3000,
          });
        } else {
          this._snackBar.open('更新失败!', 'X', {
            duration: 3000,
          });
        }
      });
    } else {
      this.wcmService.saveSMPConfig(data).subscribe((res: any) => {
        console.info(`create smp config result: ${JSON.stringify(res)}`);

        if (res.status === 200) {
          // now this smpconfig already exits in DB.
          this.isUpdate = true;
          this.lastSavedState = data;
          this._snackBar.open('创建成功!', 'X', {
            duration: 3000,
          });
        } else {
          this._snackBar.open('创建失败!', 'X', {
            duration: 3000,
          });
        }
      });
    }
  }

  async onDone(): Promise<any> {
    if (this.isEnabled) {
      // TODO: updated
      this.router.navigate(['/smp-config-list']);
    } else {
      const result = await this.openConfirmDailog('提示', '该配置尚未启用, 您确认要退出吗?');
      if (result) {
        this.router.navigate(['/smp-config-list']);
      }
    }
  }

  async toggleEnable(): Promise<any > {
    const configId = this.formData.value?.id;
    const currentStatus = this.isEnabled;
    const targetStatus = !currentStatus;
    console.info(`toggleEnable- current status: ${currentStatus}, target status: ${targetStatus}, configId: ${configId}`);
    const action = targetStatus ? '启用' : '禁用';

    try {
      const failedItem: EnableFailedItem[] = await this.toggleEnableReq(configId, targetStatus, 'smpconfig');
      if (failedItem.length === 0) {
        // change the row looks when succeed
        this.isEnabled = targetStatus;
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

    // no revert change when failed
    return false;
  }

  toggleIsProMode(): void {
    const action = this.isProMode ? '激活' : '禁用';
    this._snackBar.open(`已经${action}专家模式`, 'X', {
      duration: 3000,
    });
  }
}
