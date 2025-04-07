import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MessageService { // eslint-disable-line import/prefer-default-export
  messages: string[] = [];

  add(message: string) {
    this.messages.push(message);
  }

  clear() {
    this.messages = [];
  }
}
