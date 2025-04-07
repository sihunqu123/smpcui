/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit } from '@angular/core';
import { MessageService } from '../message.service';
/* eslint-enable @typescript-eslint/no-unused-vars */

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit { // eslint-disable-line import/prefer-default-export
  constructor(public messageService: MessageService) {}

  ngOnInit() { // eslint-disable-line class-methods-use-this
  }
}
