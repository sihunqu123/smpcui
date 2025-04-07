export interface APPConfigModel {
  configId: string;
  configName: string;
  smpType: string;
  appKey: string;
  appSecret: string;
  redirectURL: string;
  isEnabled: boolean;
}

export interface SMPConfigModel {
  id: string;
  title: string;
  appConfigId: string;
  configId: string;
  isEnabled: boolean;
}

export interface SMPConfigListModel {
  id: string;
  title: string;
  appConfigId: string;
  appconfig?: APPConfigModel;
  configId: string;
  isEnabled: boolean;
}

export interface ATMapResultModel {
  at: AuthoringTemplateModel;
  mapping: MappingModel;
  mediaType: string,
}

export interface AuthoringTemplateModel {
  itemId: string;
  title: string;
  name: string;
  updated: string;
}

export interface MappingModel {
  titleField?: string;
  contentField: string;
  linkURL?: string;
  imageFields?: string[];
  videoField?: string;
  videoTitleField?: string;
  videoCoverField?: string;
}

export interface paginateModel {
  page: number;
  pagesize: number;
  total: number;
  queryTxt: string;
  sort: string;
  order: string;
}

export interface paginateModelChild extends paginateModel {
  parentId: string;
}

export interface paginateModelAppconfig extends paginateModel {
  isEnabled?: string;
}

export interface ToBeShareModel extends MappingModel {
  authoringTemplateId: string;
  atName: string;
  atTitle: string;
  mediaType: string;
  item: ContentModel[];
  updated: string;
}

export interface ToShareModel {
  atDetail?: AuthoringTemplateModel;
  item: ContentModel;
  atConfig: ATConfig;
}

export interface PreviewDataModel {
  item: ContentModel;
  fieldsVal?: any; // in preview only
}

export interface ToPreviewModel extends MappingModel {
  authoringTemplateId: string;
  atName: string;
  atTitle: string;
  mediaType: string;
  item: ContentModel;
  updated: string;
  fieldsVal?: any; // in preview only
}

export interface PreviewModel extends ToBeShareModel {
  fieldsVal?: any;
}

export interface PreviewUIDataModel {
  header?: string;
  referFromLink?: any;
  bodyTextFields?: any;
  imageFields?: any;
  imageClass?: any;
  cover?: any;
  summary?: any;
  bodyFields?: any;
  videoField?: any;
  videoFields?: any;
  mediaFields?: any;

}

export interface ContentModel {
  itemId: string;
  title: string;
  name: string;
  updated: string;
  disabled?: boolean;
}

export interface EnableFailedItem {
  id: string;
  reason: string;
  errorCode: string;
}

export interface PreferenceATsModel {
  weibo_image?: string;
  weibo_text?: string;
  weibo_video?: string;
}

export interface PreferenceATsModelDetailed {
  weibo_image?: any;
  weibo_text?: any;
  weibo_video?: any;
}

export interface WeiBoMap {
  title?: string;
  referFromLink?: string;
  body?: string[];
}

export interface WeiBo {
  appShareConfigId?: string;
  isShare?: boolean;
  shareTypePriority?: string[];
  appConfigId?: string;
  map?: WeiBoMap;
}

export interface WeChatMap {
  title?: string;
  referFromLink?: string;
  body?: string[];
  cover?: string;
  summary?: string;
}

export interface WeChat {
  appShareConfigId?: string;
  isShare?: boolean;
  appConfigId?: string;
  map?: WeChatMap;
}

export interface WeComMap {
  title?: string;
  referFromLink?: string;
  body?: string[];
  cover?: string;
  summary?: string;
}

export interface WeCom {
  appShareConfigId?: string;
  isShare?: boolean;
  appConfigId?: string;
  map?: WeComMap;
}

export interface FacebookMap {
  title?: string;
  referFromLink?: string;
  body?: string[];
}

export interface Facebook {
  appShareConfigId?: string;
  isShare?: boolean;
  appConfigId?: string;
  map?: FacebookMap;
}

export interface ATConfig {
  atConfigId?: string;
  atConfigName?: string;
  WeiBo?: WeiBo[];
  WeChat?: WeChat[];
  WeCom?: WeCom[];
  Facebook?: Facebook[];
}

export interface ATMap {
  atId?: string;
  defaultATConfigId?: string;
  title?: string // Optional
  atConfigs?: ATConfig[];
}

export interface ScopedPreferenceModel {
  defaultAT?: string;
  defaultPreviewMode?: number;
  atMaps?: ATMap[];
}

export interface ATMapsDetail {
}

export interface EffectivePreferenceModel extends ScopedPreferenceModel{
  atMapsDetail?: ATMapsDetail;
}

export interface PreferenceModel {
  user?: ScopedPreferenceModel;
  platform?: ScopedPreferenceModel;
}
