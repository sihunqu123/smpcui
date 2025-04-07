/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  APPConfigModel, AuthoringTemplateModel, MappingModel, ContentModel, ToBeShareModel, ToPreviewModel,
  EffectivePreferenceModel, PreferenceModel, ATMapsDetail,
} from '../model/index';

import { LogUtil } from '../utils/utils';
/* eslint-enable @typescript-eslint/no-unused-vars */

let wcmService = null;
let isInitialized = false;

const mediaTypeOptions: any[] = [{ value: 'image', viewValue: '图片' }, { value: 'video', viewValue: '视频' }, { value: 'text', viewValue: '纯文本' }];

// {value: '左列-列表 右列-列表 左列- 单个 双列, ', viewValue: ''},
const previewOptions: any[] = [
  {
    name: '双列/对比',
    items: [
      { value: 0, viewValue: '左列 VS 右列 - 列表' },
      { value: 1, viewValue: '右列 VS 左列 - 列表' },
      { value: 2, viewValue: '左列 VS 右列 - 单个' },
      { value: 3, viewValue: '右列 VS 左列 - 单个' },
    ],
  },
  {
    name: '单列',
    items: [
      { value: 10, viewValue: '左列 - 列表' },
      { value: 11, viewValue: '右列 - 列表' },
      { value: 12, viewValue: '左列 - 单个' },
      { value: 13, viewValue: '右列 - 单个' },
    ],
  },
];

let preference: PreferenceModel = null;
let effectivePreference: EffectivePreferenceModel = null;
const atMapsDetail: ATMapsDetail = {};

let _snackBar: MatSnackBar = null;

const refreshPreference = async () => new Promise((resolve, reject) => {
  if (wcmService) {
    wcmService.getPreference().then((res: any) => {
      //    this._snackBar.open(`同步设置成功!`, 'X', {
      //      duration: 3000
      //    });
      // console.info(`refreshPreference succeed`);
      if (res.status === 200) {
        preference = res.content;
        // TODO: remove this eslint-disable
        computeEffectivePreference(); // eslint-disable-line @typescript-eslint/no-use-before-define
        resolve(preference);
      } else {
        reject(res.message);
      }
    }).catch((e) => {
      _snackBar.open('同步设置失败!', 'X', {
        duration: 3000,
      });
      LogUtil.error('sync failed: ');
      LogUtil.error(e);
      reject(e);
    });
  } else {
    reject(new Error('wmcService is not initialized yet!'));
  }
});
  //  return wcmService ? wcmService.getPreference().subscribe((res: any) => {
  //    if (res.status === 200) {
  /// /    this._snackBar.open(`同步设置成功!`, 'X', {
  /// /      duration: 3000
  /// /    });
  //      console.info(`refreshPreference succeed`);
  //      preference = res;
  //      // TODO: compute the effectivePreference
  //      effectivePreference = _.merge(res?.global, res?.user);
  //      resolve(true);
  //    } else {
  //      _snackBar.open(`同步设置失败!`, 'X', {
  //        duration: 3000
  //      });
  //      reject(false);
  //    }
  //  }) : reject(false);
// );

const getEffectivePreference = async () => {
  if (!preference) {
    await refreshPreference();
  }
  return effectivePreference;
};

const initDefaultAT_ = async () => {
  if (!effectivePreference) {
    await refreshPreference();
  }
  // TODO:
  if (effectivePreference?.atMaps && effectivePreference?.atMaps.length > 0) {
    //  effectivePreference.defaultATsDetailed = _.cloneDeep(effectivePreference.defaultATs);
    //  const needToFetchDetails = _.values(effectivePreference.defaultATsDetailed).filter(arg => arg && !arg.hasOwnProperty('title'));
    //  const objects = await wcmService?.getGivenAts(needToFetchDetails);
    //  needToFetchDetails.forEach(atId => {
    //    const row: AuthoringTemplateModel = objects[atId + ''];
    //    const keys = _.keys(effectivePreference.defaultATsDetailed).filter(arg => effectivePreference.defaultATsDetailed[arg ]=== atId);
    //    keys.forEach(key => {
    //      effectivePreference.defaultATsDetailed[key] = row;
    //    })
    //  });

    const ids = effectivePreference.atMaps.map((atMap) => atMap.atId);

    let needToFetchDetails = null;
    if (atMapsDetail) {
      needToFetchDetails = ids.filter((id) => !atMapsDetail[id]);
    } else {
      needToFetchDetails = ids;
    }

    let objects = null;
    try {
      objects = await wcmService?.getGivenAts(needToFetchDetails);
    } catch (e) {
      _snackBar.open('获取模板失败! 可能某些模板已经被删除了', 'X', {
        duration: 3000,
      });
      LogUtil.error(e);
      return;
    }
    needToFetchDetails.forEach((atId) => {
      const row: AuthoringTemplateModel = objects[`${atId}`];
      atMapsDetail[atId] = row;
    });
    effectivePreference.atMapsDetail = atMapsDetail;
  }
};
//
// const initDefaultAT: Function = _.throttle(initDefaultAT_, 5, {
//     leading: true,
//     trailing: true,
// });
//
const initDefaultAT: Function = initDefaultAT_;

const computeEffectivePreference = async () => {
  let targetPreference = null;
  if (!preference) return;

  if (!preference.platform && preference.user) {
    targetPreference = _.cloneDeep(preference.user);
  } else {
    if (preference?.platform) {
      targetPreference = _.cloneDeep(preference?.platform);
    }

    if (!targetPreference.atMaps) targetPreference.atMaps = [];

    if (preference?.user) {
      preference?.user.atMaps.forEach((atMap) => {
        const sameAtMap = targetPreference.atMaps.find((targetATMap) => targetATMap.atId === atMap.atId);
        if (sameAtMap) {
          if (!sameAtMap.atConfigs) sameAtMap.atConfigs = [];
          if (atMap.atConfigs) {
            sameAtMap.atConfigs.push(atMap.atConfigs);
            if (atMap.defaultATConfigId) {
              sameAtMap.defaultATConfigId = atMap.defaultATConfigId;
            }
          }
        } else {
          targetPreference.atMaps.push(atMap);
        }
      });

      // handle default AT
      const needToOverrideDefaultAt = preference?.user.defaultAT && targetPreference.atMaps.find((atMap) => atMap.atId === preference?.user.defaultAT);
      if (needToOverrideDefaultAt) {
        targetPreference.defaultAT = preference?.user.defaultAT;
      }
    }
  }

  effectivePreference = targetPreference;

  await initDefaultAT();
};

const getPreference = async () => {
  if (!preference) {
    await refreshPreference();
  }
  return preference;
};

const initConfig = async (arg: any = {}) => {
  if (!isInitialized) {
    wcmService = arg.wcmService;
    _snackBar = arg._snackBar;
    await refreshPreference();
    isInitialized = true;
  }
  return preference;
};

// setInterval(() => {
//   refreshPreference();
// }, 1000 * 60 * 5); // sync perference every 5mins

const setPreference = async (scope, scopedPreference) => {
  if (preference) {
    preference[scope] = scopedPreference;
    await computeEffectivePreference();
  }
};

export {
  mediaTypeOptions,
  previewOptions,
  getEffectivePreference,
  initConfig,
  getPreference,
  setPreference,
  refreshPreference,
  initDefaultAT,
};
