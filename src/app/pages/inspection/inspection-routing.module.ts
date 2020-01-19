import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PonGatewayComponent } from './pon-gateway/pon-gateway.component';
import { SetTopBoxComponent } from './set-top-box/set-top-box.component';
import { CanDeactivateGuard } from './guard/can-deactivate.guard';


const routes: Routes = [{
  path: 'pon-gateway',
  component: PonGatewayComponent,
  canDeactivate: [CanDeactivateGuard]
}, {
  path: 'set-top-box',
  component: SetTopBoxComponent,
  canDeactivate: [CanDeactivateGuard]
}, {
  path: '',
  redirectTo: 'pon-gateway'
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InspectionRoutingModule { }
