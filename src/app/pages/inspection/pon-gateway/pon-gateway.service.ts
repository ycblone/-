import { Injectable } from '@angular/core';

@Injectable()
export class PonGatewayService {
  private savedParams = null;

  getSavedParams() {
    return this.savedParams;
  }

  saveParams(operator: number, province: string, sn: string,
             ip: string, lightPower: string,
             powerBias: string, originalVersion: string) {
    this.savedParams = {
      operator,
      province,
      sn,
      ip,
      lightPower,
      powerBias,
      originalVersion
    };
  }

  clearSavedParams() {
    this.savedParams = null;
  }
}
