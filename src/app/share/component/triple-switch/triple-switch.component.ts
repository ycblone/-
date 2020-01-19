import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-triple-switch',
  templateUrl: './triple-switch.component.html',
  styleUrls: ['./triple-switch.component.less']
})
export class TripleSwitchComponent implements OnInit {
  statusClass = 'triple-switch-status-middle';

  @Input()
  set status(s: string) {
    this.statusClass = `triple-switch-status-${s}`;
  }

  @Output()
  onclick = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  click() {
    this.onclick.emit();
  }
}
