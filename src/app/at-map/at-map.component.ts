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

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { CommonParent } from '../util';

import { WcmService } from '../wcm.service';
import { MappingModel } from '../../model/index';
import {
  generateNanoid, customizePaginatorTxt, isDebug, LogUtil,
} from '../../utils/utils';
/* eslint-enable @typescript-eslint/no-unused-vars */

const propertyFields: any = {
  name: '属性',
  items: [
    { value: 'property:name', viewValue: 'name', type: 'text' },
    { value: 'property:title', viewValue: 'title', type: 'text' },
    //    { value: 'property:summary', viewValue:'summary', type: 'text' },
  ],
};

@Component({
  selector: 'at-map',
  templateUrl: './at-map.component.html',
  styleUrls: [],
})
export class ATMapComponent extends CommonParent implements OnChanges { // eslint-disable-line import/prefer-default-export
  @Input() itemId = '';

  @Input() appconfigId = '';

  @Input() mediaType = 'text';

  @Input() mapping!: MappingModel;

  @Output() mappingChange = new EventEmitter<MappingModel>();

  @Input() isProMode = false;

  @Input() currentATFields!: any[];

  @Output() currentATFieldsChange = new EventEmitter<any[]>();

  setCurrentATFields(val: any[]) :void {
    // no need to set in current child component, since the parent will sync the data back here.
    // this.currentATFields = val;
    this.currentATFieldsChange.emit(val);
  }

  setMapping(val: any) :void {
    this.mappingChange.emit(val);
  }

  // currentATFields : any[] = [];
  currentElementsHost: string = '';

  tmpData: any = { needURL: false };

  formData: FormGroup;

  fb: FormBuilder;

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

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    LogUtil.debug(changes.itemId);
    const setPreSetMapping = () => {
      if (!this.isProMode) {
        this.mapping.contentField = 'element:contentField';
        switch (this.mediaType) {
          case 'video':
            this.mapping.videoField = 'element:videoField';
            this.mapping.videoTitleField = 'element:videoTitleField';
            this.mapping.videoCoverField = 'element:videoCoverField';
            break;
          case 'image':
            // TODO: how to select the fixed image template?
            this.mapping.imageFields = [
              'element:imageField1',
              'element:imageField2',
              'element:imageField3',
              'element:imageField4',
              'element:imageField5',
              'element:imageField6',
              'element:imageField7',
              'element:imageField8',
              'element:imageField9',
              'element:imageField10',
              'element:imageField11',
              'element:imageField12',
              'element:imageField13',
              'element:imageField14',
              'element:imageField15',
            ];
            break;
          default:
            LogUtil.debug(`mediaType: ${this.mediaType}`);
        }
      }
    };
    if (changes.itemId && !changes.itemId.firstChange && changes.itemId.currentValue) {
      setTimeout(():void => this.getElementsOfAT(this.itemId), 0);
    }
    if (
      (changes.isProMode)
      || (changes.mediaType)
    ) {
      setPreSetMapping();
    }
    if (changes.appconfigId && changes.appconfigId.currentValue) {
      setPreSetMapping();
    }

    if (changes.mapping) {
      LogUtil.debug(`Changed mapping: ${JSON.stringify(this.mapping)}`);
      setPreSetMapping();
    }
  }

  getElementsOfAT(itemId: string): void {
    this.setCurrentATFields([]);
    this.wcmService.getElementsOfAuthoringTemplates(itemId)
      .subscribe((res: any) => {
      // console.info(`elements: ${JSON.stringify(res)}`);
        const responseJSON: any = res;
        const entry = responseJSON.feed?.entry;
        // const total = responseJSON.feed?.total;
        if (entry) {
          if (this.isProMode) {
            this._snackBar.open(`从选择的模板找到${entry.length}个元素`, 'X', {
              duration: 3000,
            });
          }
          const items: any = entry.map((item:any) => {
            const { type, name } = item;
            const title = item.title?.value;
            return {
              title,
              type,
              name,
              value: `element:${name.trim()}`,
              viewValue: `${name} | ${type} | ${title}`,
            };
          });
          // the host that current elements belong to.
          this.setCurrentATFields([propertyFields, {
            name: '元素',
            items,
          }]);
          this.currentElementsHost = itemId;
        } else {
          this.setCurrentATFields([]);
          this.setMapping({});
          if (this.isProMode) {
            this._snackBar.open('没有从选择的模板找到对应的元素', 'X', {
              duration: 3000,
            });
          } else {
            this._snackBar.open('获取文章元素失败, 请稍候重试', 'X', {
              duration: 3000,
            });
          }
        }
        this.tmpData.needURL = false;
      });

    // reset the field mapping.
    //  this.mapFormGroup.patchValue({
    //    titleField: '',
    //    contentField: '',
    //  });
    // no need to reset contentGroup list, since it's hidden
  }

  changeNeedURL(): void {
    if (this.tmpData.needURL) {
      this.mapping.titleField = 'property:title';
      this.mapping.linkURL = 'element:linkFiled';
    } else {
      this.mapping.titleField = '';
      this.mapping.linkURL = '';
    }
  }

  isValid(): boolean {
    /* eslint-disable */
    const {
      contentField,
      titleField,
      linkURL,
      imageFields,
      videoField,
      videoCoverField,
      videoTitleField,
    } = this.mapping;
    if (!contentField) {
      return false;
    }
    if (this.tmpData.needURL && (!titleField || !linkURL)) {
      return false;
    }

    switch (this.mediaType) {
      case 'image':
        if (!imageFields || imageFields.length === 0) {
          return false;
        }
        break;
      case 'video':
        if (!videoField) {
          return false;
        }
        break;
      default:
        return true;
    }
    /* eslint-disable */
    return true;
  }

  /**
   * a testOnly function
   */
  printEnv(): void {
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
    const aa = this.formData; // eslint-disable-line @typescript-eslint/no-unused-vars
    this._snackBar.open('printEnv成功', 'X', {
      duration: 3000,
    });
  }
}
