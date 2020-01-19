import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@Injectable()
export class LogService {
  constructor(
    private httpClient: HttpClient,
  ) {}

  getLogs(pageIndex: number, pageSize: number, beginTime?: string | Date, endTime?: string | Date,
          sn?: string, deviceNo?: string, failurePhenomenon?: string, operator?: number, deviceType?: string,
          goodQuality?: boolean) {
    return this.httpClient.post<any>('/sortingTool/pageSelect', {
      pageNow: pageIndex,
      pageSize,
      beginTime: beginTime ? moment(beginTime).format('YYYY/MM/DD HH:mm:ss') : undefined,
      endTime: endTime ? moment(endTime).format('YYYY/MM/DD HH:mm:ss') : undefined,
      sn,
      deviceNo,
      failurePhenomenon,
      operator,
      deviceType,
      goodQuality,
    }).pipe(
      map(ret => ({
        total: ret.data.total,
        list: ret.data.list.map((log, i) => ({
          ...log,
          ...{
            index: (pageIndex - 1) * pageSize + i + 1,
            operatorStr: this.operator2Str(log.operator),
            goodQualityStr: this.goodQuality2Str(log.goodQuality),
            startTimeStr: this.time2TimeShowStr(log.startTime),
            endTimeStr: this.time2TimeShowStr(log.endTime),
          }
        }))
      }))
    );
  }

  getStartOfDay(time: Date | string) {
    return moment(time).startOf('day').toDate();
  }

  getEndOfDay(time: Date | string) {
    return moment(time).endOf('day').toDate();
  }

  private operator2Str(operator: any) {
    switch (operator) {
      case 1:
        return '联通';
      case 2:
        return '移动';
      case 3:
        return '电信';
      default:
        return '';
    }
  }

  private goodQuality2Str(good: boolean) {
    if (good) {
      return '是';
    } else {
      return '否';
    }
  }

  private time2TimeShowStr(time) {
    if (time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    } else {
      return '';
    }
  }

  getDownLoadUrl(beginTime?: Date, endTime?: Date,
                 sn?: string, deviceNo?: string, failurePhenomenon?: string, operator?: number, deviceType?: string,
                 goodQuality?: boolean) {
    let url = '/sortingTool/exportToolLogRecord';
    let hasParam = false;
    if (beginTime && endTime) {
      const beginTimeStr = moment(beginTime).format('YYYY/MM/DD HH:mm:ss');
      const endTimeStr = moment(endTime).format('YYYY/MM/DD HH:mm:ss');
      url = url + `?beginTime=${encodeURIComponent(beginTimeStr)}&endTime=${encodeURIComponent(endTimeStr)}`;
      hasParam = true;
    }
    if (sn) {
      url = url + `${hasParam ? '&' : '?'}sn=${encodeURIComponent(sn)}`;
      hasParam = true;
    }
    if (deviceNo) {
      url = url + `${hasParam ? '&' : '?'}deviceNo=${encodeURIComponent(deviceNo)}`;
      hasParam = true;
    }
    if (failurePhenomenon) {
      url = url + `${hasParam ? '&' : '?'}failurePhenomenon=${encodeURIComponent(failurePhenomenon)}`;
      hasParam = true;
    }
    if (operator) {
      url = url + `${hasParam ? '&' : '?'}operator=${encodeURIComponent(operator)}`;
      hasParam = true;
    }
    if (deviceType) {
      url = url + `${hasParam ? '&' : '?'}deviceType=${encodeURIComponent(deviceType)}`;
      hasParam = true;
    }
    if (goodQuality !== undefined) {
      url = url + `${hasParam ? '&' : '?'}goodQuality=${encodeURIComponent(goodQuality)}`;
      hasParam = true;
    }
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getAllFailurePhenomenon() {
    return this.httpClient.get<any>('/sortingTool/getAllFailurePhenomenon').pipe(
      map(d => d.data)
    );
  }

  getDeviceNoMap() {
    return this.httpClient.get<any>('/sortingTool/getDeviceNoMap').pipe(
      map(d => d.data)
    );
  }
}
