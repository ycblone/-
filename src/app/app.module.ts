import { BrowserModule } from '@angular/platform-browser';
import { NgModule, TRANSLATIONS, LOCALE_ID, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgZorroAntdModule, NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import { I18n } from '@ngx-translate/i18n-polyfill';
import zh from '@angular/common/locales/zh';
import { httpInterceptorProviders } from './http-interceptors/http-interceptors';
import { WebSocketService } from './core/service/web-socket.service';
import { CoreModule } from './core/core.module';
import { UserService } from './core/service/user.service';

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgZorroAntdModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
  ],
  providers: [
    { provide: NZ_I18N, useValue: zh_CN },
    {
      provide: TRANSLATIONS,
      useFactory: (locale) => {
        locale = locale || 'en'; // default to english if no locale provided
        return require(`raw-loader!../i18n/messages.${locale}.xlf`).default;
      },
      deps: [LOCALE_ID]
    },
    I18n,
    // httpInterceptorProviders,
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (wsService: WebSocketService) => () => {
    //     return wsService.open('10.31.109.11', '');
    //   },
    //   deps: [WebSocketService],
    //   multi: true
    // },
    {
      provide: APP_INITIALIZER,
      useFactory: (userService: UserService) => () => {
        // return new Promise((resolve, reject) => {
        //   userService.getUseInfo().subscribe(
        //     () => resolve(true)
        //   );
        // });
      },
      deps: [UserService],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
