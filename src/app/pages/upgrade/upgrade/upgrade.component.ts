import {Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {UpgradeService} from '../upgrade.service';
import {NzMessageService, NzModalService} from 'ng-zorro-antd';
import {ActivatedRoute} from '@angular/router';
import {WebSocketService} from 'src/app/core/service/web-socket.service';
import {Observable, Subscription} from 'rxjs';
import {StorageService} from '../../../core/service/storage.service';
import {NewSnInputComponent} from '../new-sn-input/new-sn-input.component';


@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.less']
})
export class UpgradeComponent implements OnInit, AfterViewInit, OnDestroy {
  // 0：信息读取，1：读取完成
  basicStatus = 0;
  // -1:不显示 0：待升级，1：升级中，2：升级成功，3：升级失败
  updateStatus = -1;
  // 上传文件按钮状态
  upLoadStatus = false;
  // 上传文件按钮文本
  upLoadText = '';
  // 基础信息
  basicSession = {
    typeNum: '',
    macIp: '',
    hardWareType: '',
    softWareType: '',
    buildTime: ''
  };
  // 用来判断基础信息是否为空
  basicSessionLength: '';
  // 升级后信息
  upSuccess = {
    softType: '',
    buildT: ''
  };
  // 待升级设备信息
  id = '';
  sn = '';
  ip = '';
  deviceNum = '';
  materialsNum = '';
  operator = '';
  selectedOperator;
  selectedProvince = '';
  provinceList = [];
  // 文件列表
  fileList = [];
  // 订阅者
  ws$: Subscription;
  // 是否是跳转传参而来
  isParam = false;
  isSpinning = false;
  isSpinningTable = false;
  @ViewChild('snInput', {static: false})
  snInput: ElementRef;
  @ViewChild('newSnInput', {static: false})
  newSnInput: NewSnInputComponent;
  constructor(private upgradeService: UpgradeService,
              private message: NzMessageService,
              private route: ActivatedRoute,
              private wsService: WebSocketService,
              private storageService: StorageService,
              private modalService: NzModalService
  ) {
  }
  ngOnInit() {
    this.getParam();
    this.getProvince();
  }
  getParam() {
    // 接收参数
    this.route.params.subscribe(param => {
      // 如果没有sn而有运营商或者省份之类，这里等同于没有参数
      if (param.sn) {
        // 如果有参，则为跳转传参而来的，填上参数相应的字段
        this.isParam = true; /*用来判断检测完成的图标是否显示的*/
        this.ip = param.ip;
        this.materialsNum = param.materialsNum;
        this.selectedOperator = param.operator ? Number.parseInt(param.operator, 10) : undefined;
        this.selectedProvince = param.selectedProvince;
        this.deviceNum = param.deviceNum;
        this.sn = param.sn;
      } else {
        // 页面初始化时取出存储的数据
        const savedSelectedOperator = this.storageService.load('upgrade_selectedOperator');
        this.selectedProvince = this.storageService.load('upgrade_selectedProvince');
        // this.selectedOperator = savedSelectedOperator ? Number.parseInt(savedSelectedOperator, 10) : 1;
      }
    });
  }
  // 一个生命周期钩子，会在 Angular 完全初始化了组件的视图后调用。
  ngAfterViewInit(): void {
    // 自动聚焦
    (this.snInput.nativeElement as HTMLInputElement).focus();
  }

  // 获取省份信息
  getProvince() {
    this.upgradeService.getProvinceList().subscribe((privinceData) => {
      this.provinceList = privinceData.data.list;
      if (privinceData.data.defaultArea && privinceData.data.defaultArea.key) {
        this.selectedProvince = privinceData.data.defaultArea.key;
      }
    });
  }
  // 一键检测 获取设备基础信息
  checking() {
    this.isSpinning = true;
    // 判断待升级设备信息是否完善
    const isNull = this.sn && this.ip && this.selectedOperator && this.selectedProvince;
    if (isNull) {
      const session = {
        sn: this.sn,
        operator: this.selectedOperator,
        deviceCode: this.materialsNum,
        deviceNo: this.deviceNum,
        ip: this.ip,
        areaCode: this.selectedProvince,
      };
      // 信息读取状态
      this.basicStatus = 0;
      this.upgradeService.getBasicSession(session)
        .subscribe(res => {
          // 读取完成
          this.isSpinning = false;
          this.basicStatus = 1;
          this.updateStatus = 0;
          this.basicSessionLength = res.data;
          this.basicSession.typeNum = res.data.deviceNo;
          this.basicSession.macIp = res.data.mac;
          this.basicSession.hardWareType = res.data.hardVersion;
          this.basicSession.softWareType = res.data.solftwareVerson;
          this.basicSession.buildTime = res.data.buildTime;
        },
          err => {
            this.isSpinning = false;
          });
    } else {
      // 不完善的话
      this.isSpinning = false;
      this.message.warning('待升级设备信息不能为空');
    }
  }
  // 输入框失焦或回车时触发
  inputSn() {
    this.isSpinning = false;
    // 如果不为空，则请求待升级设备的其他信息
    if (this.sn && this.selectedProvince && this.selectedOperator) {
      this.upgradeService.getOtherSession({
        id: this.id,
        sn: this.sn,
        operator: this.selectedOperator,
        areaCode: this.selectedProvince
      })
        .subscribe(res => {
          this.id = res.data.id;
          this.deviceNum = res.data.deviceNo;
          this.ip = res.data.ip ? res.data.ip : this.ip;
          this.selectedOperator = res.data.operator;
          this.materialsNum = res.data.deviceCode;
          this.selectedProvince = res.data.areaCode;
        }, err => {
          if (err.error.code === '-3') {
            this.newSnInput.showInputOrNotModal(this.sn).then(newSuccess => {
              if (newSuccess) {
                this.inputSn();
              }
            });
          }
        });
    }
  }
// 上传文件的附加参数
  upParams() {
    const params = {
      sn: this.sn,
      ip: this.ip
    };
    return params;
  }
  // 上传文件的状态变化过程
  upLoadChange(event) {
    const that = this as any;
    switch (event.type) {
      // 过程中上传不可用，异常和完成可用   文本变化为上传中
      case 'progress':
        // 文件列表只展示保留最新的文件
        this.fileList = this.fileList.slice(this.fileList.length - 1);
        this.upLoadStatus = true;
        this.upLoadText = '上传中...';
        break;
      // 上传文件异常时删除在文件列表中删除异常的文件
      case 'error':
        this.fileList = this.fileList.filter(file => file.status !== 'error');
        this.upLoadStatus = false;
        this.upLoadText = '';
        break;
      case 'success':
        // 升级中状态
        this.updateStatus = 1;
        this.upLoadText = '升级中...';
        this.isSpinningTable = true;
        // 当升级状态为进行中时，开始计时
        const setTime = setTimeout(() => {
          that.updateStatus = 3;
          that.upLoadStatus = false;
          that.upLoadText = '';
          this.isSpinningTable = false;
          // 取消订阅
          that.ws$.unsubscribe();
        }, 480000);
        this.ws$ = this.wsService.monitor(['UPGRADE_STATUS']).subscribe(res => {
          // 1进行中.2升级失败.3升级成功
          switch (res.data.state) {
            case 1:
              // 升级中不可再上传
              this.upLoadStatus = true;
              break;
            case 2:
// 升级失败状态
              this.updateStatus = 3;
              this.upLoadStatus = false;
              this.isSpinningTable = false;
              this.upLoadText = '';
              // 取消订阅
              this.ws$.unsubscribe();
              clearTimeout(setTime);
              break;
            case 3:
// 升级成功状态
              this.updateStatus = 2;
              this.upLoadStatus = false;
              this.isSpinningTable = false;
              this.upLoadText = '';
              this.sn = '';
              this.deviceNum = '';
              this.materialsNum = '';
              // 成功后如有返回信息，则绑定数据
              const successM = res.data.map.afterResult;
              if (successM) {
                this.upSuccess.softType = successM.solftwareVerson;
                this.upSuccess.buildT = successM.buildTime;
              }
              // 取消订阅
              this.ws$.unsubscribe();
              clearTimeout(setTime);
              break;
          }
        });
        break;
    }
  }
  ngOnDestroy(): void {
    // 页面销毁时存贮数据
    // this.storageService.save('upgrade_selectedOperator', this.selectedOperator ? `${this.selectedOperator}` : '');
    this.storageService.save('upgrade_selectedProvince', this.selectedProvince);
  }
  // CanDeactivate：处理未保存的更改
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.upLoadStatus === true) {
      return new Promise(resolve => {
        this.modalService.info({
          nzTitle: '提示',
          nzContent: '请稍候，升级正在进行中',
          nzOnOk: () => {
            resolve(false);
          }
        });
      });
    } else {
      return true;
    }
  }
}
