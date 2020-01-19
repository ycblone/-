import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Subject, throwError } from 'rxjs';
import { filter, map } from 'rxjs/operators';

let ws: WebSocket;
let messageSubject: Subject<string>;
function onWebSocketClosed() {
  alert('服务器关闭了websocket连接');
  messageSubject.complete();
  messageSubject = undefined;
  ws = undefined;
}

@Injectable()
export class WebSocketService {
  constructor(
    private messageService: NzMessageService,
  ) {}

  open(ip: string, port: string, resetMessageSubject = true) {
    if (ws) {
      ws.removeEventListener('close', onWebSocketClosed);
      ws.close();
      ws = undefined;
    }
    if (messageSubject && resetMessageSubject) {
      messageSubject.complete();
      messageSubject = undefined;
    }

    return new Promise((resolve, reject) => {
      try {
        const wss = new WebSocket(`ws://${ip}:${port}`);
        wss.addEventListener('open', () => {
          ws = wss;
          if (messageSubject === undefined) {
            messageSubject = new Subject();
          }
          wss.addEventListener('message', (evt) => {
            messageSubject.next(evt.data);
          });
          // 出错的时候重新连接
          wss.addEventListener('error', (err) => {
            messageSubject.error('websocket出错了,尝试重新连接');
            this.open(ip, port, false);
          });
          // 服务器主动关闭的时候给提示
          wss.addEventListener('close', onWebSocketClosed);
          resolve();
        });
        wss.addEventListener('error', (err) => {
          this.reportError(`无法建立到ws://${ip}:${port}的websocket连接`);
          reject(err);
        });
      } catch (err) {
        this.reportError(`无法建立到ws://${ip}:${port}的websocket连接`);
        reject(err);
      }
    });
  }

  private reportError(error: string) {
    if (this.messageService) {
      this.messageService.error(error);
    } else {
      alert(error);
    }
  }

  // 监听消息
  monitor(filterTypes: string[]) {
    if (messageSubject === undefined) {
      const errStr = '需要先打开websocket';
      this.messageService.error(errStr);
      return throwError(new Error(errStr));
    }
    return messageSubject.pipe(
      map(v => JSON.parse(v)),
      filter(o => filterTypes.indexOf(o.type) >= 0)
    );
  }
}
