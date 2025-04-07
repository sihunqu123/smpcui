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
import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel,
  ToBeShareModel, ToPreviewModel, PreviewModel, ToShareModel, ATMap, ATConfig,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'content-preview-dialog',
  templateUrl: './content-preview-dialog.component.html',
  styleUrls: [],
})
export class ContentPreviewDialogComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  @Output() addToShare = new EventEmitter<ToShareModel[]>();

  previewItems: ContentModel[];

  atMap: ATMap;

  atDetail: AuthoringTemplateModel;

  isNeedToAdd: boolean;

  previewActionMode: String;

  selectedATConfig: ATConfig;

  openStats: any = {};

  tmpData: any = {
    tabIndex: 0,
  };

  previewMode: number = 0;

  previewOption: any = {
    isShowPC: true,
    isShowMobile: true,
    isNeedReverse: false,
    isList: true,
    currentIndex: 0,
  };

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    public dialogRef: MatDialogRef<ContentPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    injector: Injector,
  ) {
    super(injector);
    this.previewItems = data.previewItems;
    this.atMap = data.atMap;
    this.atDetail = data.atDetail;
    this.isNeedToAdd = data.isNeedToAdd;
    this.previewActionMode = data.previewActionMode || 'normal';

    // console.info(`previewItems: ${JSON.stringify(this.previewItems)}`);
    // TODO: ask user to select a config
    this.selectedATConfig = this.atMap.atConfigs.find((atConfig) => atConfig.atConfigId === this.atMap.defaultATConfigId);
  }

  // ngOnInit(): void {
  // }

  onAddToShare(rows: ToShareModel[]): void {
    this.addToShare.emit(rows);
    this.dialogRef.close(rows);
  }

  async approve() {
    const promises = this.previewItems.map((item) => new Promise((resolve, reject) => {
      this.wcmService.approveContent(item.itemId).subscribe((res: any) => {
        // console.info(`search: ${JSON.stringify(res)}`);
        // typesOfShoesRecent = [];
        // const responseJSON: any = JSON.parse(res);
        // debugger;
        const responseJSON: any = res;
        const { entry } = responseJSON;
        if (entry) {
          const {
            id, title, name, updated, summary, content, link, // eslint-disable-line @typescript-eslint/no-unused-vars
          } = entry;

          resolve(id);

          this._snackBar.open(`审批文章"${item.title}"成功`, 'X', {
            duration: 3000,
          });
        } else {
          reject(new Error('failed to approve item'));
          this._snackBar.open(`审批文章"${item.title}"失败, 请稍候重试.`, 'X', {
            duration: 3000,
          });
        }
      });
    }));
    await Promise.all(promises);
  }

  async share() {
    const shareList = [];

    const atConfig = this.selectedATConfig;
    const { atDetail } = this;
    this.previewItems.forEach((item: ContentModel) => {
      const { itemId } = item;

      const sameConfigShareItem = shareList.find((shareItem) => shareItem.atConfig?.atConfigId && shareItem.atConfig?.atConfigId === atConfig?.atConfigId);
      if (sameConfigShareItem) {
        sameConfigShareItem.contentIds.push(itemId);
      } else {
        const atId = atDetail.itemId;
        const newShareItem = {
          atId,
          atConfig,
          contentIds: [itemId],
        };
        shareList.push(newShareItem);
      }
    });

    const payload = {
      shareList,
    };
    LogUtil.debug(`share submit ${JSON.stringify(payload, null, 2)}`);

    this.wcmService.shareContents(payload)
      .subscribe((res: any) => {
        LogUtil.debug(`share result: ${JSON.stringify(res)}`);
        const responseJSON: any = res;
        if (responseJSON.status === 200) {
          this._snackBar.open('分享成功!', 'X', {
            duration: 3000,
          });
          this.dialogRef.close();
        } else {
          this._snackBar.open(`分享失败: ${responseJSON.message}. 您可以在"手动分享里"手动分享文章`, 'X', {
            duration: 5000,
          });
        }
      });

    this._snackBar.open('分享处理中... 下载和上传内容可能会花较长时间, 请耐心等待!', 'X', {
      duration: 5000,
    });
  }

  async acceptAndShare() {
    await this.approve();
    // TODO: remove this comment-out
    this.share();
  }

  // reject() {
  //
  // }

  changePreviewMOde(newSelection: any): void {
    const mode = newSelection.value;
    this.previewOption.isShowPC = [0, 1, 2, 3, 10, 12].includes(mode);
    this.previewOption.isShowMobile = [0, 1, 2, 3, 11, 13].includes(mode);
    this.previewOption.isNeedReverse = [1, 3].includes(mode);
    this.previewOption.isList = [0, 1, 10, 11].includes(mode);
  }

  changeIndex(isAdd: boolean):void {
    if (isAdd) {
      this.previewOption.currentIndex++;
    } else {
      this.previewOption.currentIndex--;
    }
  }

  shareWithATConfig() {
    // TODO:
    const atConfig = this.selectedATConfig;
    const toShare = this.previewItems.map((item) => ({
      atDetail: this.atDetail,
      item,
      atConfig,
    }));
    this.onAddToShare(toShare);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setATConfig(atConfig: ATConfig) {
    this.selectedATConfig = atConfig;
    this.tmpData.tabIndex = 1;
  }

  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    this._snackBar.open('创建配置成功', 'X', {
      duration: 3000,
    });
  }
}
