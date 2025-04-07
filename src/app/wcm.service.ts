/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _ from 'lodash';
import { DOCUMENT } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
  Component,
  OnInit,
  Inject,
  Injector,
  Injectable,
  AfterViewInit,
  ViewChild,
  InjectionToken,
  forwardRef, Optional, SkipSelf,
} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {
  Observable, of, Subject, from,
} from 'rxjs';
import {
  map, tap,
  mergeMap, catchError, startWith, debounceTime,
  retry, reduce,
} from 'rxjs/operators';

import { MessageService } from './message.service';

import { collectATEntry, LogUtil } from '../utils/utils';
/* eslint-enable @typescript-eslint/no-unused-vars */

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'text/html,application/json;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  }),
};

const guaranteeQuestionMark = (data) => {
  if (!data.isQuestionMarkAdded) {
    data.url += '?'; // eslint-disable-line no-param-reassign
  }
  return data;
};

const wcmBaseURL = '/wps/mycontenthandler/wcmrest'; // URL to wcm api
const svcBaseURL = '/wps/PA_SMP'; // URL to backend svc api

const emptyObj = {};

@Injectable({
  providedIn: 'root',
})
export class WcmService { // eslint-disable-line import/prefer-default-export
  public window: any = null;

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private _snackBar: MatSnackBar,
    private router: Router,
    // TODO: move this document/window to a common service
    @Inject(DOCUMENT) public document: Document,
  ) {
    this.window = this.document.defaultView;
  }

  getToApproveList(data: any = {}): Observable<string> {
    const {
      pagesize = 5, page = 0, queryTxt = '', sort = 'updated', order = 'ASC',
    } = data;
    const orderArg = order.toUpperCase() === 'ASC' ? 'ascending' : 'descending';
    const sortArg = sort === 'updated' ? 'modified' : sort; // the backend use 'modified' for 'updated'
    const sortVal = `${sortArg}_${orderArg}`;

    // let url = `/wps/mycontenthandler/wcmrest/query?filteraccess=Manager&type=Content&state=DRAFT&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    // let url = `/wps/mycontenthandler/wcmrest/Content/${atId}?isEnabled=${isEnabled}&pagesize=${pagesize}&page=${page}&sort=${sort}&order=${orderVal}`;
    let url = `/wps/mycontenthandler/wcmrest/query?filteraccess=Manager&state=DRAFT&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    // wps/mycontenthandler/wcmrest/query?filteraccess=Manager&type=Content&state=DRAFT
    if (queryTxt) {
      // title won't work for this API
      const queryString = `&titleLikeIgnoreCase=%25${queryTxt}%25`;
      url += queryString;
    }

    return this.http.get<any>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getAppconfigs: fetched content ${JSON.stringify(item)}`);
      }),
      catchError(this.handleError<any>('getToApproveList')),
    );
  }

  // throttle getPreference request for 3s
  getPreference: Function = _.throttle(this.getPreference_, 4000, {
    leading: true,
    trailing: false,
  });

  async getPreference_(arg: any = emptyObj): Promise<any> {
    LogUtil.debug('---------- in getPreference_');

    const data = {
      isQuestionMarkAdded: false,
      ...arg,
      url: `${svcBaseURL}/preference`,
    };

    if (data.scope) {
      guaranteeQuestionMark(data);
      data.url += `scope=${data.scope}`;
    }
    if (data.keys) {
      data.url += `keys=${data.keys}`;
    }

    const retVal = await new Promise((resolve) => {
      const obs$ = this.http.get<string>(data.url, httpOptions).pipe(
        // tap(res => this.log(`getPreference: tap`)),
        retry(3), // retry a failed request up to 3 times
        catchError(this.handleError<string>('getPreference')),
      );
      obs$.subscribe((res: any) => {
        resolve(res);
      });
    });

    return retVal;
  }

  // getPreference(arg: any = emptyObj): Observable<string> {
  //  console.info(`---------- in getPreference_`);
  //
  //  const data = {
  //    isQuestionMarkAdded: false,
  //    ...arg,
  //    url: `${svcBaseURL}/preference`,
  //  };
  //
  //  if(data.scope) {
  //    guaranteeQuestionMark(data);
  //    data.url += `scope=${data.scope}`;
  //  }
  //  if(data.keys) {
  //    data.url += `keys=${data.keys}`;
  //  }
  //
  //  const obs$ = this.http.get<string>(data.url, httpOptions).pipe(
  //    tap(res => this.log(`getPreference: tap`)),
  //    retry(3), // retry a failed request up to 3 times
  //    catchError(this.handleError<string>(`getPreference`))
  //  );
  //  obs$.subscribe((res: any) => {
  //  })
  //  return obs$;
  // }

  changePreference(data: any): Observable<string> {
    const { scope, action, payload } = data;
    const url = `${svcBaseURL}/preference?scope=${scope}&action=${action}`;

    return this.http.post<string>(url, payload, httpOptions).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('changePreference')),
    );
  }

  getGivenAppconfigs(ids: string[]): Observable<any> {
    if (ids.length === 0) {
      return of([[]]);
    }
    return this.http.get<any>(`${svcBaseURL}/appconfig/ids?ids=${ids.toString()}`, httpOptions).pipe(
      // tap(res => this.log(`getGivenAppconfigs: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<any>('getGivenAppconfigs')),
    );
  }

  saveAPPConfig(data: any): Observable<string> {
    // let url = `/wps/mycontenthandler/wcmrest/query?authoringtemplateid=${id}&state=PUBLISHED&pagesize=${pagesize}&page=${page}`;
    const url = `${svcBaseURL}/appconfig`;
    return this.http.post<string>(url, data, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getElementsOfAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('saveAPPConfig')),
    );
  }

  updateAPPConfig(data: any): Observable<string> {
    const url = `${svcBaseURL}/appconfig`;
    return this.http.put<string>(url, data, httpOptions).pipe(
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('updateAPPConfig')),
    );
  }

  getAppconfigs(data: any = {}): Observable<string> {
    const {
      pagesize = 5, page = 0, queryTxt = '', sort = 'isEnabled', order = 'ASC', isEnabled = 'all',
    } = data;
    const orderVal = order.toUpperCase();

    // let url = `/wps/mycontenthandler/wcmrest/query?authoringtemplateid=${id}&state=PUBLISHED&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    let url = `${svcBaseURL}/appconfig?isEnabled=${isEnabled}&pagesize=${pagesize}&page=${page}&sort=${sort}&order=${orderVal}`;
    if (queryTxt) {
      // title won't work for this API
      const queryString = `&queryTxt=${queryTxt}`;
      url += queryString;
    }

    return this.http.get<any>(url, {
      observe: 'response',
    }).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getAppconfigs: fetched content ${JSON.stringify(item)}`);
        /* eslint-disable */
        /*
         res.body
           {content: Array(2), status: 200, message: "Get all config success"}
         res.status
           200
         res.statusText
           "OK"
         res.headers.headers
           Map(9) {"access-control-allow-methods" => Array(1), "access-control-allow-origin" => Array(1), "connection" => Array(1), "content-language" => Array(1), "content-length" => Array(1), …}
         res.headers.get('X-Total-Count')
           "80"
         */
        /* eslint-enable */
      }),
      catchError(this.handleError<any>('getAppconfigs')),
    );
  }

  approveContent(itemId: string): Observable<string> {
    // will result to {code: "GENERIC_ERROR_0", lang: "en", text: "The action failed."}
    // let url = `/wps/mycontenthandler/wcmrest/item/${itemId}/next-stage`;
    const url = `/wps/mycontenthandler/wcmrest/item/${itemId}/next-stage`;
    const approveHttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'null', // important! Use this to bypass the useless content-type checking on the server side.
        Accept: 'text/html,application/json;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      }),
    };
    // console.info(`data: ${JSON.stringify(data)}`);
    return this.http.post<any>(url, null, approveHttpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getElementsOfAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<any>('approveContent')),
    );
  }

  getDetailsOfContent(itemId: string): Observable<string> {
    const url = `/wps/mycontenthandler/wcmrest/Content/${itemId}`;
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getElementsOfAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getDetailsOfContent')),
    );
  }

  // get all Contents that implmented given AT
  getContentOfAuthoringTemplate(data: any): Observable<string> {
    const {
      pagesize = 5, page = 0, queryTxt = '', sort = 'title', order = 'ASC', id,
    } = data;
    const orderArg = order.toUpperCase() === 'ASC' ? 'ascending' : 'descending';
    const sortArg = sort === 'updated' ? 'modified' : sort; // the backend use 'modified' for 'updated'
    const sortVal = `${sortArg}_${orderArg}`;

    // let url = `/wps/mycontenthandler/wcmrest/query?authoringtemplateid=${id}&state=PUBLISHED&pagesize=${pagesize}&page=${page}`;
    let url = `/wps/mycontenthandler/wcmrest/query?authoringtemplateid=${id}&state=PUBLISHED&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    if (queryTxt) {
      // title won't work for this API
      const queryString = `&titleLikeIgnoreCase=%25${queryTxt}%25`;
      url += queryString;
    }
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getElementsOfAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getContentOfAuthoringTemplate')),
    );
  }

  shareContents(data: any): Observable<string> {
    // TODO: use this production snippet instead.
    return this.http.post<string>(`${svcBaseURL}/share`, data, httpOptions).pipe(
      //    map(i => {
      //      console.info(`result: ${i}`);
      //      console.info(`result2: ${JSON.stringify(i)}`);
      //      return i;
      //    }),
      tap((res) => this.log(`shareContents res: ${res}, ${JSON.stringify(res)}`)),
      tap((tapVal) => this.log('fetched items')), // eslint-disable-line @typescript-eslint/no-unused-vars
      // retry(3), // do not retry a failed share request
      catchError(this.handleError<string>('shareContents')),
    );
  }

  deleteAPPConfigs(ids: string[]): Observable<string> {
    return this.http.delete<string>(`${svcBaseURL}/appconfig/ids?ids=${ids.toString()}`, httpOptions).pipe(
      tap((res) => this.log(`deleteAPPConfig: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('deleteAPPConfigs')),
    );
  }

  enableAPPConfig(data: any): Observable<string> {
    return this.http.put<string>(`${svcBaseURL}/appconfig/enable`, data, httpOptions).pipe(
      tap((res) => this.log(`enableAPPConfig res: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('enableAPPConfig')),
    );
  }

  getSMPConfigs(data: any = {}): Observable<string> {
    const {
      pagesize = 5, page = 0, queryTxt = '', sort = 'isEnabled', order = 'ASC', isEnabled = 'all',
    } = data;
    const orderVal = order.toUpperCase();

    // let url = `/wps/mycontenthandler/wcmrest/query?authoringtemplateid=${id}&state=PUBLISHED&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    let url = `${svcBaseURL}/smpconfig?isEnabled=${isEnabled}&pagesize=${pagesize}&page=${page}&sort=${sort}&order=${orderVal}`;
    if (queryTxt) {
      // title won't work for this API
      const queryString = `&queryTxt=${queryTxt}`;
      url += queryString;
    }

    return this.http.get<any>(url, {
      observe: 'response',
    }).pipe(
      tap((item) => {
        LogUtil.debug(`getSMPConfigs: fetched content ${JSON.stringify(item)}`);

        /* eslint-disable */
        /*
         res.body
           {content: Array(2), status: 200, message: "Get all config success"}
         res.status
           200
         res.statusText
           "OK"
         res.headers.headers
           Map(9) {"access-control-allow-methods" => Array(1), "access-control-allow-origin" => Array(1), "connection" => Array(1), "content-language" => Array(1), "content-length" => Array(1), …}
         res.headers.get('X-Total-Count')
           "80"
         */
        /* eslint-enable */
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<any>('getSMPConfigs')),
    );
  }

  updateSMPConfig(data: any): Observable<string> {
    return this.http.put<string>(`${svcBaseURL}/smpconfig`, data, httpOptions).pipe(
      //    map(i => {
      //      console.info(`result: ${i}`);
      //      console.info(`result2: ${JSON.stringify(i)}`);
      //      return i;
      //    }),
      tap((res) => this.log(`updateSMPConfig: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('updateSMPConfig')),
    );
  }

  deleteSMPConfigs(ids: string[]): Observable<string> {
    return this.http.delete<string>(`${svcBaseURL}/smpconfig/ids?ids=${ids.toString()}`, httpOptions).pipe(
      tap((res) => this.log(`deleteSMPConfig: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('deleteSMPConfig')),
    );
  }

  enableSMPConfig(data: any): Observable<string> {
    return this.http.put<string>(`${svcBaseURL}/smpconfig/enable`, data, httpOptions).pipe(
      tap((res) => this.log(`enableSMPConfig res: ${res}, ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('enableSMPConfig')),
    );
  }

  saveSMPConfig(data: any): Observable<string> {
    return this.http.post<string>(`${svcBaseURL}/smpconfig`, data, httpOptions).pipe(
      //    map(i => {
      //      console.info(`result: ${i}`);
      //      console.info(`result2: ${JSON.stringify(i)}`);
      //      return i;
      //    }),
      tap((res) => this.log(`res: ${res}, ${JSON.stringify(res)}`)),
      // tap(_ => this.log('saveSMPConfig')),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('saveSMPConfig')),
    );
  }

  getAppToken(state: string): Observable<string> {
    LogUtil.debug('getAppToken');
    return this.http.get<string>(`${svcBaseURL}/access-token?state=${state}`, httpOptions).pipe(
      tap((res) => this.log(`getAppToken res: ${JSON.stringify(res)}`)),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getAppToken')),
    );
  }

  doAuthorize(type: string, configId: string, appKey: string, redirectURL: string): void {
    LogUtil.debug(`doAuthorize(${type}, ${configId}, ${appKey}, ${redirectURL})`);
    const state = `${type}_${configId}`;
    if (type === 'WeiBo') {
      const url = `https://api.weibo.com/oauth2/authorize?response_type=code&client_id=${appKey}&redirect_uri=${redirectURL}&state=${state}`;
      window.open(url, '', 'height=600,width=800,top=0,left=0,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no');
    } else if (type === 'WeChat' || type === 'WeCom') {
      this.getAppToken(state).subscribe((res: any) => {
        LogUtil.debug(`getAppToken result: ${JSON.stringify(res)}`);
      });
    } else if (type === 'Facebook') {
      // TODO: implement the doAuthorize of Facebook.
      LogUtil.debug('TODO: getAppToken of Facebook');
    } else {
      LogUtil.error(`Unsupported smpType: ${JSON.stringify(type)}`);
    }
  }

  getAllAuthoringTemplates(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = 'http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/60b34cc9-23e0-431b-93af-da61c031940b?state=PUBLISHED';
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getAllAuthoringTemplates')),
    );
  }

  // get Elements of given AT
  getElementsOfAuthoringTemplates(itemId: string): Observable<string> {
    const url = `/wps/mycontenthandler/wcmrest/ContentTemplate/${itemId}/Prototype/elements?state=PUBLISHED&page=1&pagesize=100`;
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getElementsOfAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getElementsOfAuthoringTemplates')),
    );
  }

  getGivenAts(atIds: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      from(atIds).pipe(
        mergeMap((atId: string) => {
          const data = { id: atId };
          return this.searchAuthoringTemplates(data)
            .pipe(map((res: any) => {
              const responseJSON: any = res;
              const entry = responseJSON.feed?.entry;
              if (!entry) {
                throw new Error(`Error: 模板id: ${atId} 未找到`);
              }
              const items = collectATEntry(entry);
              if (items.length !== 1) {
                throw new Error(`Error: 模板id: ${atId} 返回异常`);
              }
              return items[0];
            }));
        }),
        reduce((acc, val) => ({
          [val.itemId]: val,
          ...acc,
        }), {}),
        catchError((e) => {
          reject(e);
          return of(e.error || e);
          // this.handleError<string>('createDraft')(e); // already catched in searchAuthoringTemplates
        }),
      ).subscribe((res) => {
        resolve(res);
      });
    });
  }

  // search AT
  searchAuthoringTemplates(data: any = {}): Observable<string> {
    const {
      id = '', pagesize = 5, page = 0, queryTxt = '', sort = 'title', order = 'ASC',
    } = data;
    const orderArg = order.toUpperCase() === 'ASC' ? 'ascending' : 'descending';
    const sortArg = sort === 'updated' ? 'modified' : sort; // the backend use 'modified' for 'updated'
    const sortVal = `${sortArg}_${orderArg}`;

    // const url = `/wps/mycontenthandler/wcmrest/query?type=ContentTemplate&state=PUBLISHED&sort=title_ascending&limit=100&titleLikeIgnoreCase=%25${keyword}%25`;
    // client page start from 0, while server side page start from 1.
    let url = `/wps/mycontenthandler/wcmrest/query?type=ContentTemplate&state=PUBLISHED&sort=${sortVal}&pagesize=${pagesize}&page=${page + 1}`;
    if (queryTxt) {
      // const queryString = `&titleornamelike=%25${queryTxt}%25`;
      const queryString = `&titleLikeIgnoreCase=%25${queryTxt}%25`;
      url += queryString;
    }
    if (id) {
      // const queryString = `&titleornamelike=%25${queryTxt}%25`;
      const idString = `&id=${id}`;
      url += idString;
    }
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`searchAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('searchAuthoringTemplates')),
    );
  }

  // show recent 10 authorTemplates
  getRecentAuthoringTemplates(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = '/wps/mycontenthandler/wcmrest/query?type=ContentTemplate&&pagesize=10&page=1&state=PUBLISHED&sort=modified_descending';
    return this.http.get<string>(url, httpOptions).pipe(
      tap((item) => { // eslint-disable-line @typescript-eslint/no-unused-vars
        // console.info(`getRecentAuthoringTemplates: fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('getRecentAuthoringTemplates')),
    );
  }

  testAPIContent(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = '/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5';
    return this.http.get<string>(url).pipe(
      tap((item) => {
        LogUtil.debug(`fetched content ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('testAPIContent')),
    );
  }

  testAPIContentTemplate(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = '/ContentTemplate/0857d5cf-7d27-4d95-bb93-aca1b75c7721/new-content';
    return this.http.get<string>(url).pipe(
      tap((item) => {
        LogUtil.debug(`fetched template ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('testAPIContentTemplate')),
    );
  }

  testAPIContentTemplateGET(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = `${wcmBaseURL}/ContentTemplate/9596502c-7d7a-40f3-a181-8c3857ee618a`;
    return this.http.get<string>(url).pipe(
      tap((item) => {
        LogUtil.debug(`fetched template ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('testAPIContentTemplateGET')),
    );
  }

  testAPICreateContentFromTemplate(): Observable<string> {
    // const url = `http://dx.hcl.com:10039/wps/mycontenthandler/wcmrest/Content/a9ae8c38-c7cd-4909-8373-45dce97efca5`;
    const url = '/wps/mycontenthandler/wcmrest/ContentTemplate/0857d5cf-7d27-4d95-bb93-aca1b75c7721/new-content';
    return this.http.get<any>(url).pipe(
      tap((item) => {
        LogUtil.debug(`fetched template ${JSON.stringify(item)}`);
      }),
      map((i) => {
        LogUtil.debug(`parse ${i} start`);
        // const templateJSON = JSON.parse(i);
        const templateJSON = i;
        LogUtil.debug(`parse ${i} end`);
        templateJSON.entry.name = 'credit-chen';
        templateJSON.entry.title.value = 'credit-chen';
        templateJSON.entry.link.push({
          rel: 'parent',
          href: '/wps/mycontenthandler/wcmrest/SiteArea/9447bfd5-b661-4d1c-8f69-d79f7b277697',
          lang: 'en',
          label: 'Parent',
        });
        const ele = templateJSON.entry.content.content.elements.element;
        ele.map((field: any) => {
          const retVal = field;
          switch (retVal.name) {
            case 'requesterPhone':
              retVal.data.value = '17723010081';
              break;
            case 'requesterId':
              retVal.data.value = '5001081991232434';
              break;
            case 'requesterName':
              retVal.data.value = 'Chen Tian  ndf';
              break;
            default:
              LogUtil.debug('no match');
              break;
          }
          return retVal;
        });
        LogUtil.debug(`modifeid result: ${JSON.stringify(templateJSON)}`);
        return templateJSON;
      }),
      mergeMap((postData: any) => {
        const CreateDraftURL = `${wcmBaseURL}/Content`;

        return this.http.post<any>(CreateDraftURL, postData, httpOptions);
      }),
      tap((item) => {
        LogUtil.debug(`CreateDraft result: ${JSON.stringify(item)}`);
      }),
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<any>('testAPICreateContentFromTemplate')),
    );
  }

  createDraft(itemId: string): Observable<string> {
    const data = {
      //    userid,
      //    amount,
    };
    return this.http.post<string>(`${wcmBaseURL}/${itemId}/create-draft`, data, httpOptions).pipe(
      //    map(i => {
      //      console.info(`result: ${i}`);
      //      console.info(`result2: ${JSON.stringify(i)}`);
      //      return i;
      //    }),
      tap((res) => this.log(`res: ${res}, ${JSON.stringify(res)}`)),
      tap((tapVal) => this.log('fetched items')), // eslint-disable-line @typescript-eslint/no-unused-vars
      retry(3), // retry a failed request up to 3 times
      catchError(this.handleError<string>('createDraft')),
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'unknow-operation') {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      LogUtil.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`WCM ${operation} failed: ${error.message}`);

      if (error.status === 401) {
        this._snackBar.open('登录过期, 请重新登录!', 'X', {
          duration: 3000,
        });

        setTimeout(() => {
          // this.router.navigate(['/']);
          // this.router.navigate(['/Practitioner/Home']);
          window.location.href = `${window.location.protocol + window.location.hostname}/wps/myportal/Practitioner/Home`;
        }, 3000);
      }

      // http://dx.hcl.com:10039/wps/portal

      // Let the app keep running by returning an empty result.
      return of(error.error || error);
    };
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`WCMService: ${message}`);
    LogUtil.debug(`WCMService log: ${message}`);
  }
}

// HTTPClient.get()
/*
get(
  url: string,
  options: {
  ¦ headers?: HttpHeaders |
  ¦ { [header: string]: string | string[]; };
  ¦ context?: HttpContext;
  ¦ observe?: "body" | "events" | "response";
  ¦ params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | ... 1 more ... | boolean>; };
  ¦ reportProgress?: boolean;
  ¦ responseType?: "arraybuffer" | ... 2... = {}
): Observable<any>

*/

// HTTPClient.delete()
/*

delete(
  url: string,
  options: {
    headers?: HttpHeaders |
    { [header: string]: string | string[]; };
    context?: HttpContext;
    observe?: "body" | "events" | "response";
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | ... 1 more ... | boolean>; };
    reportProgress?: boolean;
    responseType?: "arraybuffer" | ... 2... = {}
): Observable<any>

*/

// HTTPClient.delete()
/*
post(
  url: string,
  body: any,
  options: {
    headers?: HttpHeaders |
    { [header: string]: string | string[]; };
    context?: HttpContext;
    observe?: "body" | "events" | "response";
    params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | ... 1 more ... | boolean>; };
    reportProgress?: boolean;
    responseType?: "arraybuffer" | ... 2... = {}
): Observable<any>

*/
