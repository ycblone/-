import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {

  constructor() {}

  save(name: string, value: string) {
    localStorage.setItem(name, value);
  }

  load(name: string) {
    return localStorage.getItem(name);
  }
}
