import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UpgradeComponent } from './upgrade/upgrade.component';
import {CanDeactivateGuard} from '../inspection/guard/can-deactivate.guard';


const routes: Routes = [{
  path: '',
  component: UpgradeComponent,
  canDeactivate: [CanDeactivateGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class UpgradeRoutingModule { }
