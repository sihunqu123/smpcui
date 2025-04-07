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
import {
  getImgMeta, getFromWPS, generateNanoid, customizePaginatorTxt, moveElement, propertyFields, translateType, toChineseDateFormat, LogUtil,
} from '../../utils/utils';

import { WcmService } from '../wcm.service';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, paginateModelChild, ContentModel, ToBeShareModel, ToPreviewModel, PreviewModel, ATConfig, WeiBo, PreviewDataModel, PreviewUIDataModel,
} from '../../model/index';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'preview',
  templateUrl: './preview-weibo.component.html',
  styleUrls: [],
})

// const determineDimensions = (ImageUrl) => {
//   const img = new Image();
//   img.onload = function() {
//     console.info("aaaaaaaaaaaaa");
//     console.info(this.width, this.height);
//   };
//   img.src = ImageUrl;
// }

export class PreviewComponent extends CommonParent implements OnInit, OnChanges { // eslint-disable-line import/prefer-default-export
  @Input() previewItems!: ContentModel[];

  @Input() previewOption!: any;

  @Input() shareConfig!: any;

  previewData: PreviewDataModel[] = null;

  // displayName: string = getFromWPS('displayName') || '气象台超话';
  // TODO: fetch the displayName of this appconfig
  displayName: string = '气象台超话';

  rendered: any = [];

  constructor( // eslint-disable-line @typescript-eslint/no-useless-constructor
    injector: Injector,
    // @Inject(DOCUMENT) private document: Document
  ) {
    super(injector);

    // console.info(`previewOption: ${this.previewOption}`);

    // this.window = this.document.defaultView;
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (changes.previewData && changes.previewData.currentValue) {
      this.rendered = this.render();
    }
  }

  // eslint-disable-line class-methods-use-this
  async getRichTextContent(data) {
    const richText = data?.value;
    LogUtil.debug(`richText: ${richText}, displayName: ${this.displayName}`);
    // convert richText to plainText
    const richTextElement = new DOMParser().parseFromString(richText, 'text/html').documentElement;
    const innerText = richTextElement.textContent;
    const images = [];
    const imageElements = richTextElement.querySelectorAll('img');
    for (let i = 0; i < imageElements.length; i++) {
      const imageElement = imageElements[i];
      if (imageElement.src) {
        // TODO: change this as Promise.all
        const dimension = await getImgMeta(imageElement.src); // eslint-disable-line no-await-in-loop
        images.push({
          value: imageElement.src,
          type: 'ImageComponent',
          dimension,
        });
      }
    }
    //  richTextElement.querySelectorAll('img').length
    //  richTextElement.querySelectorAll('img')[0].src

    // 'a123b'.match(/(?<=a)\d+b/)[0]
    // const innerHTML = richTextElement.a;

    const value = {
      type: 'RichTextComponent',
      value: innerText,
      images,
    };
    return value;
  }

  async prepareContents(previewModel: PreviewDataModel): Promise<any > {
    // skip if it's already initialized
    if (previewModel.fieldsVal) {
      return;
    }

    // 1. fetch contents from content id.
    const { item } = previewModel;
    const { itemId } = item;
    // the content result
    const result = await this.query(itemId);
    // console.info(`result: ${JSON.stringify(result)}`);
    // 2. asign those properties to the fieldsVal
    previewModel.fieldsVal = { // eslint-disable-line no-param-reassign
    };
    Object.keys(result.properties).forEach((key) => {
      const prop = result.properties[key];
      const valueStr = (prop && prop.value) ? prop.value : prop;
      const value = {
        type: 'ShortTextComponent',
        value: valueStr,
      };
      previewModel.fieldsVal[`property:${key}`] = value; // eslint-disable-line no-param-reassign
    });
    // 3. asign those elements to the fieldsVal
    const elementsFields = {};
    const promises = result.elements.map(async (element) => {
      const {
        name, title, type, data,
      } = element;
      let value = null;
      switch (type) {
        case 'LinkComponent': {
          let url = data?.linkElement.destination.value;
          const text = data.linkElement.display.value;
          if (url?.startsWith('http://') || url?.startsWith('https://')) { // eslint-disable-line no-empty
          } else {
            url = `http://${url}`;
          }

          value = {
            type,
            value: {
              url,
              text,
            },
          };
          break;
        }
        case 'ImageComponent':
          value = {
            type,
            value: data?.image.resourceUri?.value,
            dimension: data.image.dimension,
          };
          break;
        case 'FileComponent':
          value = {
            type,
            value: data?.resourceUri?.value,
          };
          break;
        case 'ShortTextComponent':
          value = {
            type,
            value: data?.value,
          };
          break;
        case 'TextComponent':
          value = {
            type,
            value: data?.value,
          };
          break;
        case 'RichTextComponent':
          // TODO: !!!!!!!!!!!!!
          value = await this.getRichTextContent(data);
          break;
        case 'OptionSelectionComponent': {
          const selectionValue = data.optionselection.options.option.filter((_item) => _item.selected).map((_item) => _item.value).join(',');
          const selectionTitle = title.value;
          const valueText = `${selectionTitle}: ${selectionValue}`;
          value = {
            type,
            value: valueText,
          };
          break;
        }
        default:
          // TextComponent
          value = {
            type: 'TextComponent',
            value: data?.value,
          };
          LogUtil.error(`unsupported element type: ${type}`);
      }
      if (value.value || (value.images && value.images.length > 0)) {
        elementsFields[`element:${name.trim()}`] = value;
      }
    });

    await Promise.all(promises);

    Object.assign(previewModel.fieldsVal, elementsFields);
  }

  // TODO: flatern the input value.

  render(): any[] {
    const renderVal = this.previewData.filter((item) => item.fieldsVal).map((currentItem) => {
      const {
        shareTypePriority,
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
        // TODO: separe url and text from this link
        retVal.referFromLink = fieldsVal[referFromLink];
      }

      // get all needed fields defined in atConfig
      const bodyFields = body.map((fieldName) => fieldsVal[fieldName]).filter((_item) => _item?.value); // filter our not supplied fields.

      // count imageFields number
      // TODO: also includes the images inside a RichTextComponent
      const imageFields = bodyFields.filter((_item) => _item.type === 'ImageComponent');

      // count videoFields number
      const videoFields = bodyFields.filter((_item) => _item.type === 'FileComponent');
      //
      // caculate the body text fields
      const bodyTextFields = bodyFields.filter((_item) => !['FileComponent', 'ImageComponent'].includes(_item.type));
      retVal.bodyTextFields = bodyTextFields;

      // caculate the property share media type.
      let mediaType = '';
      /* eslint-disable no-labels */
      loopPriority: // eslint-disable-line no-restricted-syntax
      for (let i = 0; i < shareTypePriority?.length; i++) {
        const currentMediaType = shareTypePriority[i];

        switch (currentMediaType) {
          case 'image':
            if (imageFields.length > 0) {
              mediaType = currentMediaType;
              break loopPriority;
            }
            break;
          case 'video':
            if (videoFields.length > 0) {
              mediaType = currentMediaType;
              break loopPriority;
            }
            break;
          case 'text':
            mediaType = currentMediaType;
            break loopPriority;
          default:
            LogUtil.error(`unsupported media type: ${mediaType}`);
        }
      }
      /* eslint-enable no-labels */
      // in case none of them matched, use default to text.
      if (!mediaType) {
        mediaType = 'text';
      }

      switch (mediaType) {
        case 'image': {
          retVal.imageFields = imageFields;
          let typeClass = '';
          const { length } = imageFields;
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
          break;
        }
        case 'video':
          // only 1 video is supported in WeiBo
          [retVal.videoField] = videoFields;
          //        retVal['videoCoverField'] = videoCoverField ? fieldsVal[videoCoverField] : '';
          //        retVal['videoTitleField'] = videoTitleField ? fieldsVal[videoTitleField] : '';
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

  /**
   * query the details of a given Content
   * @param contentId
   * @return Any. The returned strucutre is:
     {
        properties: {
          id,
          title,
          summary,
          name,
          updated: toChineseDateFormat(updated),
        },
        elements: [
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
        ],
     }
   */
  async query(contentId): Promise<any> {
    return new Promise((resolve, reject) => {
      this.wcmService.getDetailsOfContent(contentId).subscribe((res: any) => {
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
