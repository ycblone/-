import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [{
  path: 'pages',
  loadChildren: () => import('./pages/pages.module').then(mod => mod.PagesModule),
}, {
  path: '',
  redirectTo: '/pages/inspection/pon-gateway',
  pathMatch: 'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
