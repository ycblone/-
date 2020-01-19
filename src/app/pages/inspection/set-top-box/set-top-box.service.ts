import { Injectable } from '@angular/core';

@Injectable()
export class SetTopBoxService {
  private savedParams = null;

  getSavedParams() {
    return this.savedParams;
  }

  saveParams(operator: number, province: string, sn: string) {
    this.savedParams = {
      operator,
      province,
      sn,
    };
  }

  clearSavedParams() {
    this.savedParams = null;
  }
}
