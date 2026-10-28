import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionStorage {
  private readonly key = 'assistente-token';
  private memory: string | null = null;
  async get(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const keys = await SecureStoragePlugin.keys();
      return keys.value.includes(this.key) ? (await SecureStoragePlugin.get({ key: this.key })).value : null;
    }
    return environment.production ? this.memory : localStorage.getItem(this.key);
  }
  async set(token: string): Promise<void> {
    if (Capacitor.isNativePlatform()) await SecureStoragePlugin.set({ key: this.key, value: token });
    else if (environment.production) this.memory = token;
    else localStorage.setItem(this.key, token);
  }
  async clear(): Promise<void> {
    this.memory = null;
    if (Capacitor.isNativePlatform()) {
      const keys = await SecureStoragePlugin.keys();
      if (keys.value.includes(this.key)) await SecureStoragePlugin.remove({ key: this.key });
    } else localStorage.removeItem(this.key);
  }
}
