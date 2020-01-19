import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, switchMap } from 'rxjs/operators';

@Injectable()
export class UserService {
  private static userInfo: {
    nickName: string,
    returnUrl: string
  };

  constructor(
    private httpClient: HttpClient,
  ) {}

  getUseInfo() {
    return new Observable<typeof UserService.userInfo>(observer => {
      if (UserService.userInfo) {
        observer.next(UserService.userInfo);
        observer.complete();
        return;
      } else {
        this.httpClient.get<any>('/sortingTool/getUserInfo').subscribe(
          (d) => {
            UserService.userInfo = d.data;
            observer.next(d.data);
            observer.complete();
          },
          err => {
            observer.error(err);
            observer.complete();
          }
        );
      }
    });
  }

  getCachedUserInfo() {
    return UserService.userInfo;
  }

  clearUserInfo() {
    return this.httpClient.post('/sortingTool/logout', {}).pipe(
      tap(() => UserService.userInfo = undefined)
    );
  }

  logout() {
    this.getUseInfo().subscribe(
      userinfo => {
        this.clearUserInfo().subscribe(
          () => location.href = userinfo.returnUrl,
          err => location.href = userinfo.returnUrl
        );
      }
    );
  }
}
