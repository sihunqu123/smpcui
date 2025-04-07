/* eslint-disable @typescript-eslint/no-unused-vars */
import { DomSanitizer } from '@angular/platform-browser';
import { PipeTransform, Pipe } from '@angular/core';
import DOMPurify from 'dompurify';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * use this pipe to enable those css in innerhtml
 * refer: https://stackoverflow.com/questions/39628007/angular2-innerhtml-binding-remove-style-attribute
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform { // eslint-disable-line import/prefer-default-export
  constructor(private sanitizer: DomSanitizer) {}

  transform(value) {
    // return value;
    const sanitizedContent = DOMPurify.sanitize(value);
    return this.sanitizer.bypassSecurityTrustHtml(sanitizedContent);
    // return this.sanitizer.bypassSecurityTrustStyle(value);
    //    // return this.sanitizer.bypassSecurityTrustXxx(style); - see docs
    // refer: https://angular.io/api/platform-browser/DomSanitizer#description
    // refer: https://stackoverflow.com/questions/31548311/angular-html-binding
    // refer: https://www.intricatecloud.io/2019/10/using-angular-innerhtml-to-display-user-generated-content-without-sacrificing-security/
  }
}
