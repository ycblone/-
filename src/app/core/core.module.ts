import { NgModule } from '@angular/core';
import { StorageService } from './service/storage.service';
import { WebSocketService } from './service/web-socket.service';
import { UserService } from './service/user.service';


@NgModule({
  declarations: [
  ],
  imports: [
  ],
  providers: [
    StorageService,
    WebSocketService,
    UserService,
  ]
})
export class CoreModule { }
