import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { InspectionService, InspectionStatus } from '../inspection.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { InspectionTableComponent } from '../inspection-table/inspection-table.component';
import { NewSnInputComponent } from '../new-sn-input/new-sn-input.component';
import { StorageService } from 'src/app/core/service/storage.service';
import { SetTopBoxService } from './set-top-box.service';

@Component({
  selector: 'app-set-top-box',
  templateUrl: './set-top-box.component.html',
  styleUrls: ['./set-top-box.component.less']
})
export class SetTopBoxComponent implements OnInit, OnDestroy, AfterViewInit {
  sn = '';

  autoInspectionList = [];

  manualInspectionList = [];

  @ViewChild('snInput', {static: false})
  snInput: ElementRef;

  provinceList = [];

  selectedProvince = '';

  selectedOperator;

  deviceNo = '';

  deviceCode = '';

  loading = false;

  initData: any;

  inspectionStatus: InspectionStatus = InspectionStatus.NotInit;

  private lastUnfinishDeviceSn = '';

  @ViewChild('inpectionTable', {static: false})
  inspectionTable: InspectionTableComponent;

  @ViewChild('newSnInput', {static: false})
  newSnInput: NewSnInputComponent;

  private isDestory = false;

  constructor(
    private service: SetTopBoxService,
    private iService: InspectionService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private storageService: StorageService,
  ) { }

  ngOnInit() {
    // const savedSelectedOperator = this.storageService.load('set_top_box_selected_operator');
    // this.selectedOperator = savedSelectedOperator ? Number.parseInt(savedSelectedOperator, 10) : 1;
    this.init();
  }

  ngAfterViewInit(): void {
    const savedParams = this.service.getSavedParams();
    // tslint:disable-next-line: no-unused-expression
    !savedParams && (this.snInput.nativeElement as HTMLInputElement).focus();
  }

  ngOnDestroy(): void {
    // this.storageService.save('set_top_box_selected_operator', this.selectedOperator ? `${this.selectedOperator}` : '');
    this.isDestory = true;
  }

  init() {
    this.sn = '';
    this.deviceCode = '';
    this.deviceNo = '';
    this.initData = undefined;

    const savedParams = this.service.getSavedParams();

    this.inspectionStatus = InspectionStatus.NotInit;
    this.lastUnfinishDeviceSn = '';

    this.loading = true;
    forkJoin(
      this.iService.getInitInspectionList('SET_TOP_BOX'),
      this.iService.getProvinceList()
    ).subscribe(
      ([data, privinceData]) => {
        this.autoInspectionList = data.autoList;
        this.manualInspectionList = data.manualList;
        this.provinceList = privinceData.data.list;
        if (privinceData.data.defaultArea && privinceData.data.defaultArea.key) {
          this.selectedProvince = privinceData.data.defaultArea.key;
        }
        if (savedParams) {
          this.selectedOperator = savedParams.operator;
          this.selectedProvince = savedParams.province;
          this.sn = savedParams.sn;
          this.inputSn();
        }
        this.loading = false;
      },
      err => this.loading = false
    );
  }

  inputSn() {
    if (this.lastUnfinishDeviceSn !== '' && this.lastUnfinishDeviceSn !== this.sn) {
      this.inspectionStatus = InspectionStatus.NotInit;
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: `上一个设备<small>（sn:${this.lastUnfinishDeviceSn}）</small>还未完成检测，点确定完成对它的检测`,
        nzOkText: '确定',
        nzCancelText: '取消',
        nzOnOk: () => {
          this._finishInspection((success) => {
            if (success) {
              this.deviceCode = '';
              this.deviceNo = '';
              this.initData = undefined;
              this._inputSn();
            }
          });
        },
        nzOnCancel: () => {
          this.deviceCode = '';
          this.deviceNo = '';
          this.lastUnfinishDeviceSn = '';
          this.initData = undefined;
          this._inputSn();
        }
      });
    } else {
      this._inputSn();
    }
  }

  private _inputSn() {
    if (this.canGetInspectionList() === false) {
      return;
    }
    const lastSn = this.sn;
    this.loading = true;
    this.iService.getInspectionList(this.selectedProvince, this.selectedOperator, this.sn).subscribe(
      ret => {
        if (ret.data.deviceType !== 'SET_TOP_BOX') {
          this.messageService.error('此设备不是机顶盒');
          this.loading = false;
          return;
        }
        this.lastUnfinishDeviceSn = lastSn;
        this.autoInspectionList = ret.autoList;
        this.manualInspectionList = ret.manualList;
        this.deviceNo = ret.data.deviceNo;
        this.deviceCode = ret.data.deviceCode;
        this.initData = ret.data;
        this.inspectionStatus = InspectionStatus.HasInit;
        this.loading = false;
      },
      err => {
        this.loading = false;
        if (err.error.code === '-3' && this.isDestory === false) {
          this.newSnInput.showInputOrNotModal(this.sn).then(newSuccess => {
            if (newSuccess) {
              this._inputSn();
            }
          });
        } else {
          this.loading = true;
          this.iService.getInitInspectionList('SET_TOP_BOX').subscribe(
            data => {
              this.autoInspectionList = data.autoList;
              this.manualInspectionList = data.manualList;
              this.loading = false;
            },
            () => this.loading = false
          );
        }
      }
    );
  }

  canGetInspectionList() {
    if (this.sn === ''
    || !this.selectedProvince
    || !this.selectedOperator
    || this.inspectionStatus === InspectionStatus.InSpection) {
      return false;
    }
    return true;
  }

  canDoInspection() {
    if (this.inspectionStatus === InspectionStatus.InSpection
      || this.initData === undefined
      || !this.deviceNo
      || !this.deviceCode
      || !this.selectedOperator
    ) {
      return false;
    }
    return true;
  }

  doInspection() {
    const data = JSON.parse(JSON.stringify(this.initData));
    delete data.itemList;
    data.deviceNo = this.deviceNo;
    data.deviceCode = this.deviceCode;
    data.areaCode = this.selectedProvince;
    data.operator = this.selectedOperator;

    this.inspectionTable.doInspection(data);
  }

  startAutoInspection() {
    this.inspectionStatus = InspectionStatus.InSpection;
  }

  finishAutoInspection() {
    this.inspectionStatus = InspectionStatus.FinishSpection;
  }

  finishInspection() {
    // return this.modalService.confirm({
    //   nzTitle: '提示',
    //   nzContent: `完成对设备<small>（sn:${this.initData.sn}）</small>的检测吗？`,
    //   nzOkText: '确定',
    //   nzCancelText: '取消',
    //   nzOnOk: () => {
    //     this._finishInspection((success) => {
    //       // tslint:disable-next-line: no-unused-expression
    //       success && this.init();
    //     });
    //   }
    // });
    this._finishInspection((success) => {
      // tslint:disable-next-line: no-unused-expression
      success && this.init();
    });
  }

  private _finishInspection(cb?: any) {
    this.loading = true;
    this.iService.finishInspection(this.initData.id).subscribe(
      () => {
        this.loading = false;
        this.inspectionStatus = InspectionStatus.AllDone;
        this.lastUnfinishDeviceSn = '';
        this.service.clearSavedParams();
        // tslint:disable-next-line: no-unused-expression
        cb && cb(true);
      },
      err => {
        this.loading = false;
        // tslint:disable-next-line: no-unused-expression
        cb && cb(false);
      }
    );
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.inspectionStatus === InspectionStatus.InSpection) {
      return new Promise(resolve => {
        this.modalService.info({
          nzTitle: '提示',
          nzContent: '请稍候，检测正在进行中',
          nzOnOk: () => {
            resolve(false);
          }
        });
      });
    } else if (this.inspectionStatus !== InspectionStatus.NotInit
      && this.inspectionStatus !== InspectionStatus.AllDone
      && this.initData) {
      this.service.saveParams(this.selectedOperator, this.selectedProvince, this.sn);
      return true;
    } else {
      this.service.clearSavedParams();
      return true;
    }
  }
}
