import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../core/service/user.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private messageService: NzMessageService,
    private userService: UserService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            if (event.body instanceof Blob) {
              return event;
            }
            if (event.body.code !== '200' || !event.body.code) {
              this.messageService.error(`${event.body.msg}`);
              // if (event.body.msgCode === '-3') {
              //   this.loginService.clearLoginInfoToLogin();
              // }
              throw new HttpErrorResponse({error: {msg: event.body.msg, code: event.body.code} });
            }
          }
        },
        err => {
          if (err instanceof HttpErrorResponse) {
            if (err.status >= 400 && err.status < 600) {
              if (err.error && err.error.message) {
                this.messageService.error(`${err.error.message}`);
              } else {
                if (typeof err.error === 'string') {
                  this.messageService.error(`http error:${err.error}`);
                } else {
                  this.messageService.error(`http error:${err.message}`);
                }
              }
              if (err.status === 401) {
                const userinfo = this.userService.getCachedUserInfo();
                if (userinfo) {
                  location.href = userinfo.returnUrl;
                }
              }
            } else if (err.status === 0) {
              this.messageService.error('掉线了');
            }
          }
        }
      )
    );
  }
}
