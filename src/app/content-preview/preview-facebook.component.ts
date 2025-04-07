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
import { DOCUMENT } from '@angular/common';
import { customAlphabet } from 'nanoid';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, ReplaySubject } from 'rxjs';
// import { map } from 'rxjs/operators';
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

import { PreviewComponent } from './preview.component';

import {
  getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel, ATConfig, WeiBo, WeChat, Facebook, PreviewDataModel, PreviewUIDataModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

const getLayoutType = (dimension) => {
  const { width, height } = dimension;
  let retVal = 'layout-square';
  if (width > height) {
    retVal = 'layout-landscape';
  } else if (width < height) {
    retVal = 'layout-protrait';
  }
  return retVal;
};

@Component({
  selector: 'preview-facebook',
  templateUrl: './preview-facebook.component.html',
  styleUrls: [],
})
export class PreviewFacebookComponent extends PreviewComponent implements OnInit, OnChanges { // eslint-disable-line import/prefer-default-export
  // @Input() previewItems!: ContentModel[];
  // @Input() previewOption!: any;
  @Input() shareConfig!: Facebook;

  // previewData: PreviewDataModel[] = null;

  // displayName: string = getFromWPS('displayName') || '气象台超话';

  // rendered: any = [];

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    injector: Injector,
    // @Inject(DOCUMENT) private document: Document
  ) {
    super(injector);

    // console.info(`previewOption: ${this.previewOption}`);
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.previewData && changes.previewData.currentValue) {
      this.rendered = this.render();
    }
  }

  // TODO: flatern the input value.

  render(): any[] {
    const renderVal = this.previewData.filter((item) => item.fieldsVal).map((currentItem) => {
      const {
        map,
      } = this.shareConfig;

      const {
        title,
        referFromLink,
        body,
      } = map;

      const {
        fieldsVal,
        item,
      } = currentItem;

      // should NOT use the original title as the preview title, we need to read the field that user specified
      // const header = `${item.title}`;
      let header = `${item.title}`; // just use it as default value if the user specified fields is empty
      if (title && fieldsVal[title] && fieldsVal[title].value) {
        header = fieldsVal[title].value;
      }

      const retVal: PreviewUIDataModel = {
        header,
        // contentField: fieldsVal[contentField],
      };

      if (referFromLink && fieldsVal[referFromLink]) {
        retVal.referFromLink = fieldsVal[referFromLink];
      }

      // get all needed fields defined in atConfig
      const bodyFields = body.map((fieldName) => fieldsVal[fieldName]).filter((_item) =>
        // filter our not supplied fields.
        // also inclues those RichTextComponent who only containes images
        _item?.value || (_item?.images && _item?.images.length > 0)); // eslint-disable-line implicit-arrow-linebreak

      // count imageFields number
      const imageFields = [];
      // const imageFields = bodyFields.filter(item => item.type === 'ImageComponent');
      // count videoFields number
      const videoFields = [];
      // const videoFields = bodyFields.filter(item => item.type === 'FileComponent');
      // caculate the body text fields
      const bodyTextFields = [];
      // bodyFields.filter(item => !['FileComponent', 'ImageComponent'].includes(item.type));

      const mediaFields = [];

      bodyFields.forEach((component) => {
        if (component.type === 'ImageComponent') {
          imageFields.push(component);
          mediaFields.push(component);
        } else if (component.type === 'FileComponent') {
          videoFields.push(component);
          mediaFields.push(component);
        } else {
          bodyTextFields.push(component);

          // also add those images in RichTextComponent into the imageFields
          if (component.type === 'RichTextComponent' && component.images) {
            imageFields.push(...component.images);
            mediaFields.push(...component.images);
          }
        }
      });

      retVal.bodyTextFields = bodyTextFields;
      retVal.mediaFields = mediaFields;

      // caculate the property share media type.
      // TODO: remvoe this eslint-disable
      const mediaType = ''; // eslint-disable-line @typescript-eslint/no-unused-vars

      if (imageFields.length > 0) {
        retVal.imageFields = imageFields;
        // TODO: use shareConfig to judge mediaType
        let typeClass = '';

        const layoutType = getLayoutType(imageFields[0].dimension);
        typeClass += layoutType;

        const { length } = imageFields;

        if (length < 4) {
          typeClass += ` preview-image${length}`;
        } else {
          typeClass += ' preview-image4';
        }
        retVal.imageClass = typeClass;
      } else if (videoFields.length > 0) {
        retVal.videoFields = videoFields;
      }

      return retVal;
    });
    return renderVal;
  }

  async query(authoringTemplateId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wcmService.getDetailsOfContent(authoringTemplateId).subscribe((res: any) => {
        // console.info(`search: ${JSON.stringify(res)}`);
        // typesOfShoesRecent = [];
        // const responseJSON: any = JSON.parse(res);
        const responseJSON: any = res;
        const { entry } = responseJSON;
        if (entry) {
          const {
            id, title, name, updated, summary, content,
          } = entry;
          // the structor of content
          /*
    "content": {
      "type": "application/vnd.ibm.wcm+xml",
      "content": {
        "elements": {
          "element": [
            {
              "name": "  Body",
              "title": {
                "lang": "en",
                "value": "文章"
              },
              "type": "RichTextComponent",
              "data": {
                "type": "text/html",
                "value": "<p>暴风预警,&nbsp;请做好<strong>防护</strong></p>\n\n<div id=\"gtx-trans\" style=\"position: absolute; left: 128px; top: -6px;\">\n<div class=\"gtx-trans-icon\">&nbsp;</div>\n</div>\n"
              }
            }
          ]
        }
      }
    }
           */
          const elements: any[] = content?.content?.elements.element;
          const retVal = {
            properties: {
              id,
              title,
              summary,
              name,
              updated: toChineseDateFormat(updated),
            },
            elements,
          };

          resolve(retVal);
        } else {
          reject(new Error('failed to fetch content details'));
          this._snackBar.open('没有得到内容', 'X', {
            duration: 3000,
          });
        }
      });
    });
  }

  ngOnInit(): void {
    this.previewData = this.previewItems.map((previewItem) => ({
      item: previewItem,
      fieldsVal: null,
    }));
    if (this.previewItems && this.shareConfig) {
      const promises = this.previewData.map((data: PreviewDataModel) => this.prepareContents(data));
      Promise.all(promises).then(() => {
        this.rendered = this.render();
      }).catch((e) => {
        LogUtil.error(e);
        this.rendered = this.render();
      });
    } else {
      LogUtil.error('this.previewData is null');
    }
  }

  printEnv(): void {
    LogUtil.debug(`previewOption: ${JSON.stringify(this.previewOption)}`);
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}
