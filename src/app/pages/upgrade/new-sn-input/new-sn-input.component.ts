import { Component, OnInit, Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd';
import {InspectionService} from '../../inspection/inspection.service';


@Component({
  selector: 'app-new-sn-input',
  templateUrl: './new-sn-input.component.html',
  styleUrls: ['./new-sn-input.component.less']
})
export class NewSnInputComponent implements OnInit {
  modalVisible = false;

  loading = false;

  sn = '';

  deviceNo;

  deviceCode = '';

  private resolve: any;

  deviceNoList = [];

  @Input()
  deviceType = '';

  constructor(
    private modalService: NzModalService,
    private iService: InspectionService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.iService.getAllDeviceNo(this.deviceType).subscribe(
      (d) => {
        this.deviceNoList = d.data;
        this.loading = false;
      },
      err => this.loading = false
    );
  }

  showInputOrNotModal(sn: string) {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: '无该设备信息，是否继续录入？',
        nzOkText: '是',
        nzCancelText: '否',
        nzOnOk: () => {
          this.sn = sn;
          this.deviceNo = undefined;
          this.deviceCode = '';
          this.modalVisible = true;
        },
        nzOnCancel: () => {
          // tslint:disable-next-line: no-unused-expression
          this.resolve && this.resolve(false);
          this.resolve = undefined;
        }
      });
    });
  }

  handleOk() {
    this.loading = true;
    this.iService.inputNewSn(this.sn, this.deviceNo, this.deviceCode).subscribe(
      () => {
        // tslint:disable-next-line: no-unused-expression
        this.resolve && this.resolve(true);
        this.resolve = undefined;
        this.loading = false;
        this.modalVisible = false;
      },
      err => this.loading = false
    );
  }

  handleCancel() {
    if (this.loading) {
      return;
    }
    // tslint:disable-next-line: no-unused-expression
    this.resolve && this.resolve(false);
    this.resolve = undefined;
    this.modalVisible = false;
  }

  canConfirm() {
    return !!this.sn && !!this.deviceNo && !!this.deviceCode;
  }
}
