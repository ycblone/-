import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InspectionRoutingModule } from './inspection-routing.module';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { PonGatewayComponent } from './pon-gateway/pon-gateway.component';
import { InspectionService } from './inspection.service';
import { ShareModule } from 'src/app/share/share.module';
import { SetTopBoxComponent } from './set-top-box/set-top-box.component';
import { InspectionTableComponent } from './inspection-table/inspection-table.component';
import { CanDeactivateGuard } from './guard/can-deactivate.guard';
import { NewSnInputComponent } from './new-sn-input/new-sn-input.component';
import { PonGatewayService } from './pon-gateway/pon-gateway.service';
import { SetTopBoxService } from './set-top-box/set-top-box.service';


@NgModule({
  declarations: [
    PonGatewayComponent,
    SetTopBoxComponent,
    InspectionTableComponent,
    NewSnInputComponent
  ],
  imports: [
    CommonModule,
    InspectionRoutingModule,
    FormsModule,
    NgZorroAntdModule,
    ShareModule,
  ],
  providers: [
    InspectionService,
    PonGatewayService,
    SetTopBoxService,
    CanDeactivateGuard
  ]
})
export class InspectionModule { }
