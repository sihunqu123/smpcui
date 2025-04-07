/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
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
import { ActivatedRoute } from '@angular/router';
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
import { MatAccordion } from '@angular/material/expansion';

import { MatPaginator, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';

import { MatSort, SortDirection, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import {
  initConfig, getPreference, setPreference, getEffectivePreference, mediaTypeOptions, previewOptions, refreshPreference,
} from '../../config/config';

import { CommonParent } from '../util';

import {
  generateNanoid, customizePaginatorTxt, moveElement, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel, EffectivePreferenceModel, ScopedPreferenceModel,
} from '../../model/index';

import { NewATMapDialogComponent } from './new-at-map-dialog.component';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-preference-scoped',
  templateUrl: './preference-scoped.component.html',
  styleUrls: [],
})
export class PreferenceScopedComponent extends CommonParent implements OnInit { // eslint-disable-line import/prefer-default-export
  @Input() isOrphan: boolean = false;

  @Input() scope?: string = 'platform';

  @ViewChild(MatAccordion) accordion: MatAccordion;

  tmpData: any = {
    atMapNameMode: 'view',
    openedPanel: '',
    accordion: {

    },
  };

  openStats = {

  };

  formData: FormGroup;

  formAT: FormGroup;

  formPreview: FormGroup;

  fb: FormBuilder;

  // TODO
  // scopedPreference: ScopedPreferenceModel;
  scopedPreference: ScopedPreferenceModel = null;
  // {
  //  defaultAT: '38d7abe7-9b3f-4680-a951-13d9cb79e671',
  //  atMaps: [
  //    {
  //      "atId": "38d7abe7-9b3f-4680-a951-13d9cb79e671",
  //      "defaultATConfigId": "0857d5cf-7d27-4d95-bb93-atConfigId",
  //      title: '社交媒体模板',
  //      "atConfigs": [
  //        {
  //          "atConfigId": "0857d5cf-7d27-4d95-bb93-atConfigId",
  //          "atConfigName": "多媒体配置",
  //          "WeiBo": [
  //            {
  //              "appShareConfigId": "002342df-appShareConfigId",
  //              "isShare": true,
  //              "shareTypePriority": [
  //                "video",
  //                "image",
  //                "text"
  //              ],
  //              "appConfigId": "Bi7F9JxwuCSaSQUrI9UNv",
  //              "map": {
  //                "title": "property:title",
  //                "referFromLink": "element:referFromLink",
  //                "body": [
  //                  "element:p1",
  //                  "element:p2",
  //                  "element:p3",
  //                  "element:p4",
  //                  "element:p5",
  //                  "element:p6",
  //                  "element:p7",
  //                  "element:p8",
  //                  "element:p9",
  //                  "element:p10",
  //                  "element:image1",
  //                  "element:image2",
  //                  "element:image3",
  //                  "element:image4",
  //                  "element:image5",
  //                  "element:image6",
  //                  "element:image7",
  //                  "element:image8",
  //                  "element:image9",
  //                  "element:image10",
  //                  "element:image11",
  //                  "element:image12",
  //                  "element:image13",
  //                  "element:image14",
  //                  "element:image15",
  //                  "element:image16",
  //                  "element:image17",
  //                  "element:image18",
  //                  "element:image19",
  //                  "element:image20",
  //                  "element:video1",
  //                  "element:video2"
  //                ]
  //              }
  //            }
  //          ],
  //          "WeChat": [
  //            {
  //              "appShareConfigId": "002342df-appShareConfigId2",
  //              "isShare": true,
  //              "appConfigId": "ZiVwVvBwHZPFIkVXatTda",
  //              "map": {
  //                "title": "property:title",
  //                "referFromLink": "element:referFromLink",
  //                "body": [
  //                  "element:p1",
  //                  "element:p2",
  //                  "element:p3",
  //                  "element:p4",
  //                  "element:p5",
  //                  "element:p6",
  //                  "element:p7",
  //                  "element:p8",
  //                  "element:p9",
  //                  "element:p10",
  //                  "element:image1",
  //                  "element:image2",
  //                  "element:image3",
  //                  "element:image4",
  //                  "element:image5",
  //                  "element:image6",
  //                  "element:image7",
  //                  "element:image8",
  //                  "element:image9",
  //                  "element:image10",
  //                  "element:image11",
  //                  "element:image12",
  //                  "element:image13",
  //                  "element:image14",
  //                  "element:image15",
  //                  "element:image16",
  //                  "element:image17",
  //                  "element:image18",
  //                  "element:image19",
  //                  "element:image20",
  //                  "element:video1",
  //                  "element:video2"
  //                ],
  //                "cover": "element:cover",
  //                "summary": "element:summary",
  //              }
  //            }
  //          ]
  //        }
  //      ]
  //    }
  //  ],
  // };

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    private route: ActivatedRoute,
    injector: Injector,
  ) {
    super(injector);
    this.fb = fb;
    //  this.formData = this.fb.group({
    //    name: ['', [Validators.required, Validators.maxLength(150)]],
    //    smpType: ['WeiBo', [Validators.required, Validators.maxLength(100)]],
    //    // appKey: ['381698247', [Validators.required, Validators.maxLength(100)]],
    //    appKey: ['', [Validators.required, Validators.maxLength(100)]],
    //    // appSecret: ['b61f85ec4095c9816655c9312d46ba5d', [Validators.required, Validators.maxLength(100)]],
    //    appSecret: ['', [Validators.required, Validators.maxLength(100)]],
    //    // redirectURL: ['https://api.weibo.com/oauth2/default.html', [Validators.required, Validators.maxLength(250)]],
    //    redirectURL: ['', [Validators.required, Validators.maxLength(250)]],
    //    configId: ['', Validators.maxLength(30)],
    //  });

    this.formAT = this.fb.group({
      //    'weibo_image': ['', Validators.required],
      //    'weibo_text': ['', Validators.required],
      //    'weibo_video': ['', Validators.required],
    });

    this.formPreview = this.fb.group({
      defaultPreviewMode: [0, Validators.required],
    });

    //  this.route.queryParams.subscribe(params => {
    //    // console.log(params);
    //    if (params.configId) {
    //      this.isEditMode = true;
    //      const { configId, configName, smpType, appKey, appSecret, redirectURL } = params;
    //      this.formData.setValue({
    //        name: configName, smpType, appKey, appSecret, redirectURL, configId,
    //      });
    //      this.isEnabled = params.isEnabled === "true" ? true : false;
    //    }
    //  });
  }

  async ngOnInit() {
    // this.initConfig();
    await this.initComponent();
    const preference = await getPreference();
    // TODO: init scopedPreference
    this.scopedPreference = preference[this.scope];
    // console.info(`this.scopedPreference: ${JSON.stringify(this.scopedPreference)}`);
    // init formPreview
    this.formPreview.patchValue({
      defaultPreviewMode: this.scopedPreference?.defaultPreviewMode,
    });
    // init formAT
    //  if(this.scopedPreference && this.scopedPreference.defaultATs) {
    //    const ats = ['weibo_image', 'weibo_text', 'weibo_video'];
    //    const ids = [];
    //    for(let i = 0; i< ats.length; i++) {
    //      const atType = ats[i];
    //      const atId = this.scopedPreference.defaultATs[atType];
    //      if(atId) {
    //        ids.push(atId);
    //      }
    //    }
    //
    //    let objects;
    //    try {
    //       objects = await this.wcmService?.getGivenAts(ids);
    //    } catch(e) {
    //      this._snackBar.open(`获取模板失败! 可能某些模板已经被删除了`, 'X', {
    //        duration: 3000
    //      });
    //      console.error(e);
    //      return;
    //    }
    //
    //    ats.forEach(atType => {
    //      const atId = this.scopedPreference.defaultATs[atType];
    //      const row = objects[atId];
    //      if(row) {
    //        this.formAT.patchValue({
    //          [atType]: row,
    //        });
    //      }
    //    });
    //
    //  }

    if (this.scopedPreference?.atMaps?.length > 0) {
      const ids = this.scopedPreference.atMaps.map((atMap) => atMap.atId);
      let objects;
      try {
        objects = await this.wcmService?.getGivenAts(ids);
      } catch (e) {
        this._snackBar.open('获取模板失败! 可能某些模板已经被删除了', 'X', {
          duration: 3000,
        });
        LogUtil.error(e);
        return;
      }

      this.scopedPreference.atMaps.forEach((atMap) => {
        const { atId } = atMap;
        const row = objects[atId];
        if (row) {
          atMap.title = row.title; // eslint-disable-line no-param-reassign
        }
      });
      this.syncOpenStats();
    }
  }

  syncOpenStats() {
    // initialize openStats
    const openStats = this.scopedPreference?.atMaps.reduce((accumulator, atMap) => {
      const { atId } = atMap;
      return {
        ...accumulator,
        [atId]: {
          isOpen: false,
          child: {},
        },
      };
    }, {});
    // this.openStats = _.merge(openStats, this.openStats);
    _.merge(openStats, this.openStats);
    _.merge(this.openStats, openStats);
  }

  async deleteATMap(event, atId) {
    event.stopPropagation();
    LogUtil.debug(`delete atMapId: ${atId}`);
    const payload = {
      atMaps: [
        {
          atId,
        },
      ],
    };
    const data = {
      scope: this.scope,
      action: 'delete',
      payload,
    };
    LogUtil.debug(`deleteATMap: ${JSON.stringify(data, null, 2)}`);

    await this.onSubmit(data);
    // TODO: add remove atMap from preference
    // _.remove(this.scopedPreference.atMaps, function(item) {
    //   return item.atId === atId;
    // });
  }

  async addATMap() {
    // TODO: fetch disabledItems.
    const disabledItems = [];
    const dialogRef = this.dialog.open(NewATMapDialogComponent, {
      backdropClass: 'preview-dialog-backdropClass',
      panelClass: 'preview-dialog-panel',
      // TODO: replace
      data: {
        disabledItems,
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      LogUtil.debug(`Dialog result: ${result}`);
      if (result) {
        LogUtil.debug(`select AT: ${JSON.stringify(result)}`);
        const newId = result.itemId;
        const atConfigId = generateNanoid();
        const payload = {
          atMaps: [
            {
              atId: newId,
              defaultATConfigId: atConfigId,
              atConfigs: [
                {
                  atConfigId,
                  atConfigName: '新建模板配置',
                },
              ],
            },
          ],
        };

        const data = {
          scope: this.scope,
          action: 'upsert',
          payload,
        };
        LogUtil.debug(`changePreference: ${JSON.stringify(data, null, 2)}`);

        try {
          await this.onSubmit(data);
          //        // TODO: add new atMap to preference
          //        this.scopedPreference = _.merge(this.scopedPreference, payload);
          //        this._snackBar.open(`新建模板配置成功!`, 'X', {
          //          duration: 3000
          //        });
        } catch (e) {
          LogUtil.error(e);
          this._snackBar.open('新建模板配置失败!', 'X', {
            duration: 3000,
          });
        }
      } else {
        LogUtil.debug('select AT cancled');
      }
    });
  }

  async addATConfig(event, atId) {
    event.stopPropagation();
    LogUtil.debug(`addATConfig: ${JSON.stringify(atId)}`);
    const atConfigId = generateNanoid();
    const payload = {
      atMaps: [
        {
          atId,
          atConfigs: [
            {
              atConfigId,
              atConfigName: '新建模板配置',
            },
          ],
        },
      ],
    };

    const data = {
      scope: this.scope,
      action: 'upsert',
      payload,
    };
    LogUtil.debug(`changePreference: ${JSON.stringify(data, null, 2)}`);

    try {
      await this.onSubmit(data);
      // TODO: add new atMap to preference
      // this.scopedPreference = _.merge(this.scopedPreference, payload);
    } catch (e) {
      LogUtil.error(e);
    }
  }

  async onATSelect(row: AuthoringTemplateModel, atType): Promise<any > {
    const newId = row.itemId;

    const data = {
      scope: this.scope,
      action: 'upsert',
      payload: {
        defaultATs: {
          [atType]: newId,
        },
      },
    };
    LogUtil.debug(`changePreference: ${JSON.stringify(data, null, 2)}`);

    await this.onSubmit(data);

    // TODO: move the update of UI into the callback of api call.
    this.formAT.patchValue({
      [atType]: row,
    });
    // this.scopedPreference.defaultATs[atType] = newId;
  }

  async changeDefaultPreviewMOde(event): Promise<any > {
    const newVal = event?.value;
    const data = {
      scope: this.scope,
      action: 'upsert',
      payload: {
        defaultPreviewMode: newVal,
      },
    };
    LogUtil.debug(`changePreference: ${JSON.stringify(data, null, 2)}`);

    await this.onSubmit(data);

    // TODO: move the update of UI into the callback of api call.
    this.formPreview.patchValue({
      defaultPreviewMode: newVal,
    });

    this.scopedPreference.defaultPreviewMode = newVal;
  }

  async removePreference(payload): Promise<any> {
    const data = {
      scope: this.scope,
      action: 'delete',
      payload,
    };
    await this.onSubmit(data);
  }

  async onSubmit(data): Promise<any> {
    data.scope = this.scope; // eslint-disable-line no-param-reassign
    LogUtil.debug(`changePreference: ${JSON.stringify(data, null, 2)}`);
    return new Promise((resolve, reject) => {
      this.wcmService.changePreference(data).subscribe(async (res: any) => {
        let action = '设置';
        if (data.action === 'delete') {
          action = '删除';
        }
        if (res.status === 200) {
          this._snackBar.open(`${action}成功!`, 'X', {
            duration: 3000,
          });
          // TODO: change the way of geting preference via a svc
          // reload preference
          const preference = await refreshPreference();

          // TODO: init scopedPreference
          this.scopedPreference = preference[this.scope];
          this.syncOpenStats();

          resolve(true);
        } else {
          this._snackBar.open(`${action}失败: ${res.message}`, 'X', {
            duration: 5000,
          });
          reject(new Error(res.message));
        }
      });
    });
  }

  async useGlobal(type): Promise<any> {
    const payload = {
      [type]: '',
    };
    return this.removePreference(payload);
  }

  async setDefaultAT(event, atId) {
    event.stopPropagation();
    const payload = {
      defaultAT: atId,
    };

    const data = {
      action: 'upsert',
      payload,
    };

    try {
      await this.onSubmit(data);
      // TODO: add new atMap to preference
      // this.scopedPreference = _.merge(this.scopedPreference, payload);
    } catch (e) {
      LogUtil.error(e);
    }
  }

  /**
   * a testOnly function
   */
  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars

    LogUtil.debug(`aaa: ${JSON.stringify(this.openStats, null, 2)}`);
  }
}
