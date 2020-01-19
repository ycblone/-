import { Component, OnInit, Input, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { InspectionService } from '../inspection.service';
import { WebSocketService } from 'src/app/core/service/web-socket.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { delayWhen, tap, catchError } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-inspection-table',
  templateUrl: './inspection-table.component.html',
  styleUrls: ['./inspection-table.component.less']
})
export class InspectionTableComponent implements OnInit, OnDestroy {
  @Input()
  deviceInfo;

  _autoInspectionList = [];
  @Input()
  set autoInspectionList(d: any[]) {
    this._autoInspectionList = d;
    this._autoInspectionList.forEach(i => i.instructions = this.sanitizer.bypassSecurityTrustHtml(i.instructions));
  }

  get autoInspectionList() {
    return this._autoInspectionList;
  }

  private _manualInspectionList = [];
  @Input()
  set manualInspectionList(d: any[]) {
    this._manualInspectionList = d;
    this._manualInspectionList.filter(i => i.result === 0 || i.result === 1)
                              .forEach(i => this.setManualResult(i, i.result));
    this._manualInspectionList.forEach(i => i.instructions = this.sanitizer.bypassSecurityTrustHtml(i.instructions));
  }

  get manualInspectionList() {
    return this._manualInspectionList;
  }

  @Input()
  loading = false;

  @Input()
  wsItemType: string;

  @Input()
  wsFinishType: string;

  @Input()
  deviceType: string;

  @Input()
  useSingleManualInspection = false;

  @Output()
  startLoading = new EventEmitter<void>();

  @Output()
  finishLoading = new EventEmitter<void>();

  @Output()
  startInspection = new EventEmitter<void>();

  @Output()
  finishInspection = new EventEmitter<void>();

  private wsSubscription: Subscription;

  abnormalModalVisible = false;

  abnormalList = [];

  abnormalItem: any;

  private isInInspection = false;

  savedManualItemsResult = [];

  constructor(
    private host: ElementRef,
    private iService: InspectionService,
    private wsService: WebSocketService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.unSubscribeWebsocket();
  }

  doInspection(data: any) {
    this.unSubscribeWebsocket();
    this.startInspection.emit();
    this.isInInspection = true;

    let hasSetAllItemUndo = false;

    // 需要提前监听ws,以免ws在doInspection之前到达
    this.wsSubscription = this.wsService.monitor([this.wsItemType, this.wsFinishType]).subscribe(
      (d) => {
        if (hasSetAllItemUndo === false) {
          this.setAllItemUndo();
          hasSetAllItemUndo = true;
        }
        if (d.type === this.wsItemType) {
          let autoOrManual = 'auto';
          let item = this._autoInspectionList.find(i => i.businessType === d.data.businessType);
          if (item === undefined) {
            item = this._manualInspectionList.find(i => i.businessType === d.data.businessType);
            autoOrManual = 'manual';
          }
          if (item) {
            item.instructions = this.sanitizer.bypassSecurityTrustHtml(d.data.instructions) || item.instructions;
            item.status = d.data.status;
            if (item.status === 2) {
              if (autoOrManual === 'auto') {
                item.result = d.data.result;
              } else {
                const r = this.savedManualItemsResult.find(s => s.id === item.id);
                if (r) {
                  item.result = r.result;
                }
              }
            }
            this.scrollItemIntoView(`${autoOrManual}_${item.index}`);
          }
        }
        if (d.type === this.wsFinishType) {
          // 将所有自动项目状态设置成 已完成
          // this.autoInspectionList.forEach(i => i.status = 2);
          // 将所有手动项目状态设置成 已完成
          // this.manualInspectionList.forEach(i => i.status = 2);
          if (d.data.index != 0) {
            this.messageService.error(d.data.desc);
          } else {
            this.messageService.success(d.data.desc || '全部项目检测完成');
          }
          this.finishInspection.emit();
          this.isInInspection = false;
          this.unSubscribeWebsocket();
        }
      },
      err => {
        console.error(err);
        this.finishInspection.emit();
        this.isInInspection = false;
        this.unSubscribeWebsocket();
      },
      () => {
        this.finishInspection.emit();
        this.isInInspection = false;
        this.unSubscribeWebsocket();
      }
    );

    this.beginLoading();

    this.iService.doInspection(data).subscribe(
      () => {
        if (hasSetAllItemUndo === false) {
          this.setAllItemUndo();
          hasSetAllItemUndo = true;
        }
        this.stopLoading();
      },
      () => {
        this.stopLoading();
        this.finishInspection.emit();
        this.isInInspection = false;
        this.unSubscribeWebsocket();
      }
    );
  }

  unSubscribeWebsocket() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = undefined;
    }
  }

  doSingleManualInspection(item) {
    this.startInspection.emit();
    this.isInInspection = true;
    const originalStatus = item.status;
    // 将状态设为进行中
    item.status = 1;
    this.iService.doSingleInspection(this.deviceInfo.id, item.businessType).subscribe(
      data => {
        this.setManualResult(item, data.data.result);
        item.instructions = data.data.instructions;
        item.status = originalStatus;
        this.finishInspection.emit();
        this.isInInspection = false;
      },
      err => {
        item.status = originalStatus;
        this.finishInspection.emit();
        this.isInInspection = false;
      }
    );
  }

  private setAllItemUndo() {
    this.saveManualItemsResult();
    this._autoInspectionList.forEach(d => {
      d.result = null;
      d.status = d.needCommand === 0 ? 2 : 0;
    });
    this._manualInspectionList.forEach(d => {
      if (d.needCommand === 0) {
        d.status = 2;
      } else {
        d.status = 0;
        d.result = null;
      }
    });
  }

  private saveManualItemsResult() {
    this.savedManualItemsResult = this._manualInspectionList.map(d => ({id: d.id, result: d.result}));
  }

  private scrollItemIntoView(itemId: string) {
    const resultRow = this.host.nativeElement as HTMLDivElement;
    const el = resultRow.querySelector(`#${itemId}`) as any;
    if (el) {
      if (el.scrollIntoViewIfNeeded) {
        el.scrollIntoViewIfNeeded();
      } else {
        el.scrollIntoView();
      }
    }
  }

  getTripleSwitchFromResult(result: any) {
    switch (result) {
      case 0:
        return 'right';
      case 1:
        return 'left';
      default:
        return 'middle';
    }
  }

  recordManualResult(item, setNormal: boolean) {
    if (this.isInInspection) {
      return;
    }
    if (setNormal && item.result === 1) {
      return;
    }
    if (!setNormal && item.result === 0) {
      return;
    }
    if (this.canManualResultBtnClick(item) === false) {
      return false;
    }
    if (typeof item.id === 'number' && typeof item.businessType === 'number') {
      if (setNormal) {
        this.setManualItemNormal(item);
      } else {
        this.showAbnormalModal(item);
      }
    }
  }

  private showAbnormalModal(item) {
    this.beginLoading();
    this.iService.getFailurePhenomenon(this.deviceType).subscribe(
      (d) => {
        const list = d.data[`${item.businessType}`];
        if (list) {
          this.abnormalList = list.map(v => ({value: v, selected: false}));
          this.abnormalItem = item;
          this.abnormalModalVisible = true;
        }
        this.stopLoading();
      },
      err => this.stopLoading()
    );
  }

  hasSelectAnyAbnormalItem() {
    return !!this.abnormalList.find(i => i.selected);
  }

  private setManualItemNormal(item) {
    this.beginLoading();
    this.iService.updateToolLogItem(item.id, 1, '').subscribe(
      () => {
        this.setManualResult(item, 1);
        this.stopLoading();
      },
      err => this.stopLoading()
    );
  }

  closeAbnormalModal() {
    this.abnormalModalVisible = false;
  }

  setAbnormal() {
    const reply = this.abnormalList.filter(i => i.selected).map(i => i.value).join(',');
    this.setManualItemAbNormal(this.abnormalItem, reply);
  }

  private setManualItemAbNormal(item, reply: string) {
    this.beginLoading();
    this.iService.updateToolLogItem(item.id, 0, reply).subscribe(
      () => {
        this.setManualResult(item, 0);
        this.abnormalModalVisible = false;
        this.stopLoading();
      },
      err => {
        this.stopLoading();
      }
    );
  }

  canSingleManualOperaBtnClick(item) {
    if (this.isInInspection) {
      return false;
    }
    if (!this.deviceInfo || typeof this.deviceInfo.id !== 'number') {
      return false;
    }
    if (typeof item.businessType !== 'number') {
      return false;
    }
    return this.canManualResultBtnClick(item);
  }

  private canManualResultBtnClick(item) {
    if (item.result === 0) {
      return true;
    }
    return !this._manualInspectionList.find(i => i.result === 0);
  }

  setManualResult(item: any, result: number) {
    const index = item.index;
    item.result = result;
    // 将之前不是异常的result全设成正常
    this._manualInspectionList.forEach((v, i) => {
      if (i < index - 1 && v.result !== 0) {
        v.result = 1;
      }
    });
  }

  private beginLoading() {
    this.loading = true;
    this.startLoading.emit();
  }

  private stopLoading() {
    this.loading = false;
    this.finishLoading.emit();
  }
}
