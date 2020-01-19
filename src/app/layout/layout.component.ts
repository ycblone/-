import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';
import { UserService } from '../core/service/user.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.less']
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  username = '未知';

  @ViewChild('nzSider', { static: true, read: ElementRef })
  nzSider: ElementRef;

  private scrollBar: PerfectScrollbar;

  @HostListener('window:resize')
  onResize() {
    this.updateScrollBar();
  }

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.userService.getUseInfo().subscribe(
      u => {
        this.username = u.nickName;
      }
    );
  }

  ngOnDestroy(): void {
    this.scrollBar.destroy();
    this.scrollBar = undefined;
  }

  ngAfterViewInit(): void {
    this.scrollBar = new PerfectScrollbar(this.nzSider.nativeElement);
    this.updateScrollBar();
  }

  updateScrollBar() {
    setTimeout(() => {
      // tslint:disable-next-line: no-unused-expression
      this.scrollBar && this.scrollBar.update();
    }, 100);
  }

  logout() {
    this.userService.logout();
  }
}
