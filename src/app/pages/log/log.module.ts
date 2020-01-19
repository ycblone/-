import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogRoutingModule } from './log-routing.module';
import { LogComponent } from './log/log.component';
import { LogService } from './log/log.service';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [LogComponent],
  imports: [
    CommonModule,
    LogRoutingModule,
    FormsModule,
    NgZorroAntdModule
  ],
  providers: [
    LogService
  ]
})
export class LogModule { }
