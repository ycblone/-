import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UpgradeService {

  constructor(private httpClient: HttpClient) {
  }

  // Observable可观察对象类型，写上更规范
  getBasicSession(params: any): Observable<any> {
    return this.httpClient.post<any>('/update/checkBeforeUpdateInfo', params);
  }
  getOtherSession(params: any): Observable<any> {
    return this.httpClient.post<any>('/update/getBeforeUpdateInfo', params);
  }
  getProvinceList(): Observable<any> {
    return this.httpClient.get<any>('/sortingTool/getAreaCode');
  }
}
