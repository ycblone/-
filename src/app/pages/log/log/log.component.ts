import { Component, OnInit } from '@angular/core';
import { LogService } from './log.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.less']
})
export class LogComponent implements OnInit {
  logList = [];

  loading = false;

  total = 0;

  pageIndex = 1;

  pageSize = 20;

  dateRange = [];

  searchSn = '';

  searchDeviceNo;

  deviceNoList = [];

  private deviceType2DeviceNoList;

  failurePhenomenonList = [];

  searchFailurePhenomenon = undefined;

  searchOperator = undefined;

  searchDeviceType = undefined;

  searchGoodQuality = undefined;

  constructor(
    private service: LogService,
  ) { }

  ngOnInit() {
    this.loading = true;
    forkJoin(
      this.service.getAllFailurePhenomenon(),
      this.service.getDeviceNoMap()
    ).subscribe(
      ([failurePhenomenonList, deviceNoMap]) => {
        this.failurePhenomenonList = failurePhenomenonList;
        this.deviceType2DeviceNoList = deviceNoMap;
        this.loading = false;
        this.search();
      },
      err => this.loading = false
    );
    this.search();
  }

  search(reload = false) {
    if (reload) {
      this.pageIndex = 1;
    }
    this.loading = true;
    this.service.getLogs(
      this.pageIndex, this.pageSize, this.getStartTime(), this.getEndTime(),
      this.searchSn ? this.searchSn : undefined,
      this.searchDeviceNo ? this.searchDeviceNo : undefined,
      this.searchFailurePhenomenon ? this.searchFailurePhenomenon : undefined,
      this.searchOperator ? this.searchOperator : undefined,
      this.searchDeviceType ? this.searchDeviceType : undefined,
      typeof this.searchGoodQuality === 'boolean' ? this.searchGoodQuality : undefined,
    ).subscribe(
      ({total, list}) => {
        this.total = total;
        this.logList = list;
        this.loading = false;
      },
      err => this.loading = false
    );
  }

  private getStartTime() {
    return this.dateRange[0] ? this.service.getStartOfDay(this.dateRange[0]) : undefined;
  }

  private getEndTime() {
    return this.dateRange[1] ? this.service.getEndOfDay(this.dateRange[1]) : undefined;
  }

  download() {
    this.service.getDownLoadUrl(this.getStartTime(), this.getEndTime(),
      this.searchSn, this.searchDeviceNo, this.searchFailurePhenomenon, this.searchOperator, this.searchDeviceType, this.searchGoodQuality);
  }

  searchDeviceTypeChange() {
    this.searchDeviceNo = undefined;
    if (!this.searchDeviceType) {
      this.deviceNoList = [];
    } else {
      if (this.deviceType2DeviceNoList && this.deviceType2DeviceNoList[this.searchDeviceType]) {
        this.deviceNoList = this.deviceType2DeviceNoList[this.searchDeviceType];
      }
    }
  }
}
