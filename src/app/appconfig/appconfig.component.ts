/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Component,
  OnInit,
  Inject,
  Injector,
  InjectionToken,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { CommonParent } from '../util';
import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';

import { WcmService } from '../wcm.service';
/* eslint-enable @typescript-eslint/no-unused-vars */

// export interface AuthoringTemplate extends PeriodicElement {
//   itemId: string;
//   titleField: string;
//   contentField: string;
// }

const smpTypeDefaultValue = 'WeChat';

@Component({
  selector: 'app-appconfig',
  templateUrl: './appconfig.component.html',
  styleUrls: ['./appconfig.component.scss'],
})
export class AppconfigComponent extends CommonParent { // eslint-disable-line import/prefer-default-export
  hideSecret: boolean = true;

  isEnabled: boolean = false;

  isEditMode: boolean = false;

  formData: FormGroup;

  fb: FormBuilder;

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
    this.formData = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      smpType: [smpTypeDefaultValue, [Validators.required, Validators.maxLength(100)]],
      // appKey: ['381698247', [Validators.required, Validators.maxLength(100)]],
      appKey: ['', [Validators.required, Validators.maxLength(100)]],
      // appSecret: ['b61f85ec4095c9816655c9312d46ba5d', [Validators.required, Validators.maxLength(100)]],
      appSecret: ['', [Validators.required, Validators.maxLength(100)]],
      // redirectURL: ['https://api.weibo.com/oauth2/default.html', [Validators.required, Validators.maxLength(250)]],
      redirectURL: ['', [Validators.maxLength(250)]],
      configId: ['', Validators.maxLength(30)],
      corpId: ['', Validators.maxLength(32)],
      toType: ['', Validators.maxLength(20)],
      toValue: ['', Validators.maxLength(250)],
    });

    this.route.queryParams.subscribe((params) => {
      // console.log(params);
      if (params.configId) {
        this.isEditMode = true;
        const {
          configId, configName, smpType = smpTypeDefaultValue, appKey, appSecret, redirectURL, corpId, toType = '', toValue,
        } = params;
        this.formData.setValue({
          name: configName, smpType, appKey, appSecret, redirectURL, configId, corpId, toType, toValue,
        });
        this.isEnabled = params.isEnabled === 'true';
      }
    });
  }

  // ngOnInit(): void {
  // }

  /**
   * a testOnly function
   */
  printEnv(): void {
    const aa = this.formData; // eslint-disable-line @typescript-eslint/no-unused-vars
    this._snackBar.open('创建应用配置成功', 'X', {
      duration: 3000,
    });

    LogUtil.debug(`formData: ${this.formData.value}`);
  }

  onCancel(): void {
    LogUtil.debug(`formData: ${this.formData.value}`);
  }

  // isCanSave(): boolean {
  //  const isTypeOK = [
  //    'text',
  //    'TextComponent',
  //    'ShortTextComponent',
  //    'ImageComponent',
  //    'FileComponent',
  //    'RichTextComponent',
  //  ].includes(item.type);
  //  const isAlreadyAdded = this.formMap.value?.body?.indexOf(item.value) > -1;
  //
  //  return isTypeOK && !isAlreadyAdded;
  //
  // }

  updateAppConfig(data): void {
    const {
      smpType, configId, appKey, redirectURL,
    } = data;
    LogUtil.debug(`update app config: ${JSON.stringify(data, null, 2)}`);
    this.wcmService.updateAPPConfig(data)
      .subscribe((res: any) => {
        LogUtil.debug(`update app config result: ${JSON.stringify(res)}`);
        if (res.status === 200) {
          this._snackBar.open('更新成功!', 'X', {
            duration: 3000,
          });
          this.wcmService.doAuthorize(smpType, configId, appKey, redirectURL);
        } else {
          this._snackBar.open('更新失败：服务器内部错误', 'X', {
            duration: 3000,
          });
        }
      });
  }

  createAppConfig(data): void {
    const {
      smpType, configId, appKey, redirectURL,
    } = data;
    LogUtil.debug(`create app config: ${JSON.stringify(data, null, 2)}`);
    this.wcmService.saveAPPConfig(data)
      .subscribe((res: any) => {
        LogUtil.debug(`create app config result: ${JSON.stringify(res)}`);
        if (res.status === 200) {
        // now this app config already exits in DB.
          this.isEditMode = true;
          this.wcmService.doAuthorize(smpType, configId, appKey, redirectURL);
          this._snackBar.open('保存成功!', 'X', {
            duration: 3000,
          });
        } else if (res.errorCode === 'ERR_EXIST') {
          this._snackBar.open('保存失败：config id 已经存在了', 'X', {
            duration: 3000,
          });
        } else {
          this._snackBar.open('保存失败：服务器内部错误', 'X', {
            duration: 3000,
          });
        }
      });
  }

  onSubmit(): void {
    LogUtil.debug('submit');
    const {
      name: configName, smpType, appKey, appSecret, redirectURL, corpId, toType, toValue,
    } = this.formData.value;
    let configId;
    if (this.isEditMode) {
      configId = this.formData.value.configId;
      this.updateAppConfig({
        configId,
        configName,
        smpType,
        appKey,
        appSecret,
        redirectURL,
        corpId,
        toType,
        toValue,
      });
    } else {
      configId = generateNanoid();

      this.formData.patchValue({
        configId,
      });
      this.createAppConfig({
        configId,
        configName,
        smpType,
        appKey,
        appSecret,
        redirectURL,
        corpId,
        toType,
        toValue,
      });
    }
  }

  toggleEnable(): void {
    const {
      configId, smpType, appKey, redirectURL,
    } = this.formData.value;
    const targetStatus = this.isEnabled;
    const data = { ids: [configId], targetStatus };
    this.wcmService.enableAPPConfig(data)
      .subscribe((res: any) => {
        LogUtil.debug(`${targetStatus ? 'enable' : 'disable'} app config result: ${JSON.stringify(res)}`);
        if (res.status !== 200) {
          this.isEnabled = false;
          switch (res.errorCode) {
            case 'ERR_NOT_FOUND':
              this._snackBar.open('找不到该社交媒体配置', 'X', {
                duration: 3000,
              });
              break;
            case 'ERR_INVALID_TOKEN':
            case 'ERR_EXPIRED_TOKEN':
              this.wcmService.doAuthorize(smpType, configId, appKey, redirectURL);
              break;
            default:
              this._snackBar.open('服务器内部错误', 'X', {
                duration: 3000,
              });
          }
        }
      });
  }
}
