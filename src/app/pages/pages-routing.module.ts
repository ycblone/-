import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layout/layout.component';


const routes: Routes = [{
  path: '',
  component: LayoutComponent,
  children: [{
    path: 'inspection',
    loadChildren: () => import('./inspection/inspection.module').then(mod => mod.InspectionModule)
  }, {
    path: 'upgrade',
    loadChildren: () => import('./upgrade/upgrade.module').then(mod => mod.UpgradeModule)
  }, {
    path: 'log',
    loadChildren: () => import('./log/log.module').then(mod => mod.LogModule)
  }, {
    path: '',
    redirectTo: 'inspection'
  }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
