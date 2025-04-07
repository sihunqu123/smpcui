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

import { getFromWPS, LogUtil } from '../../utils/utils';
import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'content-preview',
  templateUrl: './content-preview.component.html',
  styleUrls: [],
})
export class ContentPreviewComponent extends CommonParent implements OnInit, OnChanges { // eslint-disable-line import/prefer-default-export
  @Input() previewItems!: ToPreviewModel[];

  @Input() previewOption!: any;

  displayName: string = getFromWPS('displayName') || '气象台超话';

  rendered: any = [];

  constructor(
    public dialog: MatDialog,
    fb: FormBuilder,
    breakpointObserver: BreakpointObserver,
    injector: Injector,
  ) {
    super(injector);

    LogUtil.debug(`previewOption: ${this.previewOption}`);
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.previewItems && changes.previewItems.currentValue) {
      this.rendered = this.render();
    }
  }

  async prepareContents(previewModel: ToPreviewModel): Promise<any > {
    if (previewModel.fieldsVal) {
      return;
    }

    const { item } = previewModel;
    const { itemId } = item;
    const result = await this.query(itemId);
    // console.info(`result: ${JSON.stringify(result)}`);
    previewModel.fieldsVal = { // eslint-disable-line no-param-reassign
    };
    Object.keys(result.properties).forEach((key) => {
      const prop = result.properties[key];
      previewModel.fieldsVal[`property:${key}`] = (prop && prop.value) ? prop.value : prop; // eslint-disable-line no-param-reassign
    });
    const elementsFields = result.elements.reduce((accumulator, element) => {
      const {
        name, title, type, data, // eslint-disable-line @typescript-eslint/no-unused-vars
      } = element;
      let value = '';
      switch (type) {
        case 'LinkComponent':
          value = data?.linkElement.destination?.value;
          break;
        case 'ImageComponent':
          value = data?.image.resourceUri?.value;
          break;
        case 'FileComponent':
          value = data?.resourceUri?.value;
          break;
        default:
          // TextComponent
          value = data?.value;
      }
      return {
        ...accumulator,
        [`element:${name.trim()}`]: value,
      };
    }, {});

    Object.assign(previewModel.fieldsVal, elementsFields);
  }

  // TODO: flatern the input value.

  render(): any[] {
    const renderVal = this.previewItems.filter((item) => item.fieldsVal).map((currentItem) => {
      const {
        fieldsVal,
        mediaType,
        atName, // eslint-disable-line @typescript-eslint/no-unused-vars
        atTitle,
        item,
        contentField,
        titleField,
        linkURL,
        imageFields,
        videoField,
        videoCoverField,
        videoTitleField,
      } = currentItem;
      const header = `${atTitle}-${item.title}`;
      const renderTitle = titleField ? fieldsVal[titleField] : ''; // eslint-disable-line @typescript-eslint/no-unused-vars
      const retVal = {
        header,
        contentField: fieldsVal[contentField],
      };

      if (linkURL && titleField) {
        retVal.titleField = fieldsVal[titleField];
        retVal.linkURL = fieldsVal[linkURL];
      }

      switch (mediaType) {
        case 'image': {
          const value = imageFields?.map((imageField: string) => fieldsVal[imageField]).filter((val) => val);
          retVal.imageFields = value;
          let typeClass = '';
          if (value) {
            const { length } = value;
            if (length === 1) {
              typeClass = 'preview-image1';
            } else if (length < 4) {
              typeClass = 'preview-image3';
            } else if (length < 7) {
              typeClass = 'preview-image6';
            } else if (length < 10) {
              typeClass = 'preview-image9';
            } else {
              typeClass = 'preview-image10';
            }
            retVal.imageClass = typeClass;
          }
          break;
        }
        case 'video':
          retVal.videoField = videoField ? fieldsVal[videoField] : '';
          retVal.videoCoverField = videoCoverField ? fieldsVal[videoCoverField] : '';
          retVal.videoTitleField = videoTitleField ? fieldsVal[videoTitleField] : '';
          break;
        case 'text':
          // no extra fileded needed for type text
          break;
        default:
          LogUtil.debug(`mediaType: ${mediaType}`);
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
              updated,
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
    if (this.previewItems) {
      const promises = this.previewItems.map((item: ToPreviewModel) => this.prepareContents(item));
      Promise.all(promises).then(() => {
        this.rendered = this.render();
      }).catch((e) => { // retry on once
        LogUtil.error(e);
        this.rendered = this.render();
      });
    } else {
      LogUtil.error('this.previewItems is null');
    }
  }

  printEnv(): void {
    LogUtil.debug(`previewOption: ${JSON.stringify(this.previewOption)}`); // eslint-disable-line @typescript-eslint/no-unused-vars
    const _this = this; // eslint-disable-line @typescript-eslint/no-unused-vars
  }
}
