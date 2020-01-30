import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export enum InspectionStatus {
  NotInit,
  HasInit,
  InSpection,
  FinishSpection,
  AllDone
}

@Injectable()
export class InspectionService {
  constructor(private httpClient: HttpClient) {}

  getInitInspectionList(deviceName: string) {
    return this.httpClient.get<any>(`/sortingTool/getToolItems/${deviceName}`).pipe(
      map(data => {
        const manualList = data.data.filter(i => i.automatic === 0).map((i, index) => ({...i, ...{index: index + 1}}));
        const autoList = data.data.filter(i => i.automatic === 1).map((i, index) => ({...i, ...{index: index + 1 + manualList.length}}));
        return {
          autoList,
          manualList
        };
      })
    );
  }

  getInspectionList(areaCode: string, operator: number, sn: string) {
    return this.httpClient.post<any>('/sortingTool/init', {
      areaCode,
      operator,
      sn
    }).pipe(
      map(data => {
        const manualList = data.data.itemList.filter(i => i.automatic === 0)
                                             .map((i, index) => ({...i, ...{index: index + 1}}));
        const autoList = data.data.itemList.filter(i => i.automatic === 1)
                                           .map((i, index) => ({...i, ...{index: index + 1 + manualList.length}}));
        return {
          autoList,
          manualList,
          data: data.data
        };
      })
    );
  }

  doInspection(initData: any) {
    return this.httpClient.post<any>('/sortingTool/startBusiness', initData);
  }

  doSingleInspection(id: number, businessType: number) {
    return this.httpClient.get<any>('/sortingTool/ping', {
      params: {
        id: `${id}`,
        businessType: `${businessType}`
      }
    });
  }

  getProvinceList() {
    return this.httpClient.get<any>('/sortingTool/getAreaCode');
  }

  getFailurePhenomenon(type: string) {
    return this.httpClient.get<any>(`/sortingTool/getFailurePhenomenon/${type}`);
  }

  updateToolLogItem(id: number, result: number, reply: string) {
    return this.httpClient.post<any>('/sortingTool/updateToolLogItem', {
      id,
      result,
      reply,
      status: 2
    });
  }

  finishInspection(id: number) {
    return this.httpClient.post('/sortingTool/updateToolLog', {
      id,
      status: 2
    });
  }

  inputNewSn(sn: string, deviceNo: string, deviceCode: string) {
    return this.httpClient.post('/sortingTool/addSnDeviceNoRel', {
      sn,
      deviceNo,
      deviceCode
    });
  }

  getAllDeviceNo(deviceType: string) {
    return this.httpClient.get<any>(`/sortingTool/getAllDeviceNo/${deviceType}`);
  }
  getOnline() {
    return this.httpClient.get<any>('/onlinePresentations/');
  }
  getSwiper() {
    return this.httpClient.get<any>('/onlinePresentationsBanners/');
  }
  getSelect() {
    return this.httpClient.get<any>('/dualSelect/');
  }
  getCompany() {
    return this.httpClient.get<any>('/company/');
  }
  getPractice() {
    return this.httpClient.get<any>('/internship/');
  }
  getJob() {
    return this.httpClient.get<any>('/post/');
  }
  getSelectType() {
    return this.httpClient.get<any>('/dualSelectType/');
  }
  delectOnline(id: any) {
    return this.httpClient.delete<any>(`/onlinePresentations/${id}`);
  }
  delectSelect(id: any) {
    return this.httpClient.delete<any>(`/dualSelect/${id}`);
  }
  delectCompany(id: any) {
    return this.httpClient.delete<any>(`/company/${id}`);
  }
  delectPractice(id: any) {
    return this.httpClient.delete<any>(`/internship/${id}`);
  }
  delectJob(id: any) {
    return this.httpClient.delete<any>(`/post/${id}`);
  }

}
