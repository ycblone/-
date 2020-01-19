import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgComponent } from './component/svg/svg.component';
import { TripleSwitchComponent } from './component/triple-switch/triple-switch.component';


@NgModule({
  declarations: [
    SvgComponent,
    TripleSwitchComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [
  ],
  exports: [
    SvgComponent,
    TripleSwitchComponent
  ]
})
export class ShareModule { }
