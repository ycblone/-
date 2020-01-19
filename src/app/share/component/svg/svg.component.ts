import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.less']
})
export class SvgComponent {

  @Input() href: string;

  @Input() fill?: string;

  @Input() fontSize: string;
}
