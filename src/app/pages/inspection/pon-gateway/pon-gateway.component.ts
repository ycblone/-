import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy} from '@angular/core';
import {InspectionService, InspectionStatus} from '../inspection.service';
import {StorageService} from 'src/app/core/service/storage.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {forkJoin, Observable, timer} from 'rxjs';
import {InspectionTableComponent} from '../inspection-table/inspection-table.component';
import {NewSnInputComponent} from '../new-sn-input/new-sn-input.component';
import {Router} from '@angular/router';
import {PonGatewayService} from './pon-gateway.service';
import {HttpClient} from '@angular/common/http';

declare const COS: any;
declare const $: any;

@Component({
  selector: 'app-pon-gateway',
  templateUrl: './pon-gateway.component.html',
  styleUrls: ['./pon-gateway.component.less']
})
export class PonGatewayComponent implements OnInit, AfterViewInit, OnDestroy {
  onlineId = '';
  delectOnlineId = '';
  title = '';
  business = '';
  companyName = '';
  address = '';
  text = '';
  filePath = '';
  pptPath = '';
  fileList = [];
  selectedOperator;
  onlineSession = [];
  // ————————————————
  sn = '';
  autoInspectionList = [];

  manualInspectionList = [];

  loading = false;

  @ViewChild('snInput', {static: false})
  snInput: ElementRef;

  provinceList = [];

  selectedProvince = '';

  // selectedOperator;

  deviceNo = '';

  deviceCode = '';

  ip = '192.168.1.1';

  lightPower = '0';

  powerBias = '2.0';

  originalVersion = '';

  initData: any;

  inspectionStatus: InspectionStatus = InspectionStatus.NotInit;

  private lastUnfinishDeviceSn = '';

  private isDestory = false;

  @ViewChild('inpectionTable', {static: false})
  inspectionTable: InspectionTableComponent;

  @ViewChild('newSnInput', {static: false})
  newSnInput: NewSnInputComponent;

  cos: any;

  constructor(
    private service: PonGatewayService,
    private iService: InspectionService,
    private storageService: StorageService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private router: Router,
    private httpClient: HttpClient
  ) {
  }

  ngOnInit() {
    this.getAllOnline();
    this.cos = new COS({
      // 必选参数
      getAuthorization: (options, callback) => {
        // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
        // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
        // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048
        $.get('http://www.qitianoffer.club/sts', data => {
          const credentials = data.credentials;
          this.cos = new COS({
          // callback({
          Region: 'ap-chengdu',
            Bucket: 'qitianpubred-1300782360',
            SecretId: credentials.tmpSecretId,
            SecretKey: credentials.tmpSecretKey,
            XCosSecurityToken: credentials.sessionToken,
          });
        });
      }
    });

    // this.cos = new COS({
    //   SecretId: 'AKIDUeBbvMA1GTINMI9rRzV2dCoGfIsQmGcx',
    //   SecretKey: 'Rp6KTVQEnna8QSkrjNlzxfDWdVBettdE',
    // });
    // timer(2000).subscribe(() => {
    //   // this.cos.getBucket({
    //   //   Bucket: 'examplebucket-1250000000', /* 必须 */
    //   //   Region: 'COS_REGION', /* 存储桶所在地域，必须字段 */
    //   //   Prefix: 'a/', /* 非必须 */
    //   // }, (err, data) => {
    //   //   console.log(err || data.Contents);
    //   // });
    //
    // });
  }

  // 获取所有线上宣讲会
  getAllOnline() {
    this.iService.getOnline().subscribe(res => {
        this.onlineSession = res.data;
        console.log(this.onlineSession);
    });
  }
  // 删除某个宣讲会
  delectOnline() {
    this.iService.delectOnline(this.delectOnlineId).subscribe(res => {
      console.log('删除', res);
    });
  }
// 点击上传
  doInspection() {
    console.log('id', this.onlineId);
    // this.cos.putObject({
    //   Bucket: 'qitianpubred-1300782360', /* 必须 */
    //   Region: 'ap-chengdu',     /* 存储桶所在地域，必须字段 */
    //   Key: 'img',              /* 必须 */
    //   StorageClass: 'STANDARD',
    //   Body: this.fileList[0].originFileObj, // 上传文件对象
    //   // onProgress(progressData) {
    //   //   console.log(JSON.stringify(progressData));
    //   // }
    // }, (err, res) => {
    //   console.log(err || res);
    // });
    this.httpClient.post<any>('/onlinePresentations/', {
      id: this.onlineId,
      business: this.business,
      companyName: this.companyName,
      cover: this.filePath,
      ppt: this.pptPath,
      deliveryAddress: this.address,
      isWangjiansheng: this.selectedOperator,
      title: this.title,
    })
      .subscribe(res => {
        console.log(res);
      });
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
      // 将现有状态保存
      this.service.saveParams(this.selectedOperator, this.selectedProvince, this.initData.sn,
        this.ip, this.lightPower, this.powerBias, this.originalVersion);
      return true;
    } else {
      this.service.clearSavedParams();
      return true;
    }
  }

  goToUpdatePage() {
    this.navigateToUpdatePage();
  }

  private navigateToUpdatePage() {
    this.router.navigate(['/pages/upgrade', {
      ip: this.ip,
      sn: this.sn,
      materialsNum: this.deviceCode,
      deviceNum: this.deviceNo,
      operator: this.selectedOperator,
      selectedProvince: this.selectedProvince,
    }]);
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
      this.iService.getInitInspectionList('PON_GATEWAY'),
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
          this.ip = savedParams.ip;
          this.lightPower = savedParams.lightPower;
          this.powerBias = savedParams.powerBias;
          this.originalVersion = savedParams.originalVersion;
          this.inputSn();
        }
        this.loading = false;
      },
      err => this.loading = false
    );
  }

  private initParam() {
    this.ip = this.storageService.load('pon_gateway_ip') || this.ip;
    this.lightPower = this.storageService.load('pon_gateway_light_power') || this.lightPower;
    this.powerBias = this.storageService.load('pon_gateway_power_bias') || this.powerBias;
    this.originalVersion = this.storageService.load('pon_gateway_original_version') || this.originalVersion;
    // const savedSelectedOperator = this.storageService.load('pon_gateway_selected_operator');
    // this.selectedOperator = savedSelectedOperator ? Number.parseInt(savedSelectedOperator, 10) : 1;
  }

  ngAfterViewInit(): void {
    const savedParams = this.service.getSavedParams();
    // tslint:disable-next-line: no-unused-expression
    !savedParams && (this.snInput.nativeElement as HTMLInputElement).focus();
  }

  inputSn() {
    if (this.lastUnfinishDeviceSn !== '' && this.lastUnfinishDeviceSn !== this.sn) {
      this.modalService.confirm({
        nzTitle: '提示',
        nzContent: `上一个设备<small>（sn:${this.lastUnfinishDeviceSn}）</small>还未完成检测，点确定完成对它的检测`,
        nzOkText: '确定',
        nzCancelText: '取消',
        nzOnOk: () => {
          this._finishInspection((success) => {
            if (success) {
              this.inspectionStatus = InspectionStatus.NotInit;
              this.deviceCode = '';
              this.deviceNo = '';
              this.initData = undefined;
              this._inputSn();
            }
          });
        },
        nzOnCancel: () => {
          this.inspectionStatus = InspectionStatus.NotInit;
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
        if (ret.data.deviceType !== 'PON_GATEWAY') {
          this.messageService.error('此设备不是PON网关');
          this.loading = false;
          return;
        }
        this.lastUnfinishDeviceSn = lastSn;
        this.autoInspectionList = ret.autoList;
        this.manualInspectionList = ret.manualList;
        this.deviceNo = ret.data.deviceNo;
        this.deviceCode = ret.data.deviceCode;
        if (ret.data.powerBias) {
          this.powerBias = `${ret.data.powerBias}`;
        }
        if (ret.data.ip) {
          this.ip = ret.data.ip;
        }
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
          this.iService.getInitInspectionList('PON_GATEWAY').subscribe(
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

  ngOnDestroy(): void {
    this.storageService.save('pon_gateway_ip', this.ip);
    this.storageService.save('pon_gateway_light_power', this.lightPower);
    this.storageService.save('pon_gateway_power_bias', this.powerBias);
    this.storageService.save('pon_gateway_original_version', this.originalVersion);
    this.isDestory = true;
    // this.storageService.save('pon_gateway_selected_operator', this.selectedOperator ? `${this.selectedOperator}` : '');
  }

  canDoInspection() {
    const powerBiasIsNumber = !!this.powerBias && isNaN(Number.parseFloat(this.powerBias)) === false;
    if (this.inspectionStatus === InspectionStatus.InSpection
      || this.initData === undefined
      || !this.ip
      || !this.deviceNo
      || !this.deviceCode
      || !this.lightPower
      || !powerBiasIsNumber
      || !this.originalVersion
      || !this.selectedOperator
    ) {
      return false;
    }
    return true;
  }
  // formatterDb(value: number) {
  //   return `${value}db`;
  // }

  // parserDb(value: string) {
  //   return value.replace('db', '');
  // }
}
