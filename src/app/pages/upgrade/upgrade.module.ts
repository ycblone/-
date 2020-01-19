import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/share/share.module';
import { UpgradeRoutingModule } from './upgrade-routing.module';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import {FormsModule} from '@angular/forms';
import {NewSnInputComponent} from './new-sn-input/new-sn-input.component';
import {InspectionService} from '../inspection/inspection.service';


@NgModule({
  declarations: [
    UpgradeComponent,
    NewSnInputComponent
  ],
  imports: [
    CommonModule,
    UpgradeRoutingModule,
    NgZorroAntdModule,
    ShareModule,
    FormsModule,

  ],
  providers: [
    InspectionService
  ]
})
export class UpgradeModule { }
