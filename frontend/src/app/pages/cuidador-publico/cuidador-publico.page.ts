import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { authError } from '../../services/auth-error';
import { DirectoryApi, type CuidadorPublico } from '../../services/directory-api';

@Component({
  selector: 'app-cuidador-publico',
  imports: [ CurrencyPipe, RouterLink, IonContent, IonButton],
  templateUrl: './cuidador-publico.page.html',
  styleUrls: ['../directory.scss'],
})
export class CuidadorPublicoPage {
  readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(DirectoryApi);
  readonly cuidador = signal<CuidadorPublico | null>(null);
  readonly erro = signal('');
  readonly carregando = signal(true);
  ionViewWillEnter(): void {
    void this.carregar();
  }
  async carregar(): Promise<void> {
    this.cuidador.set(null);
    this.erro.set('');
    this.carregando.set(true);
    try {
      this.cuidador.set(await firstValueFrom(this.api.cuidador(this.route.snapshot.paramMap.get('id') ?? '')));
    } catch (e) {
      this.erro.set(authError(e));
    } finally {
      this.carregando.set(false);
    }
  }
  safeUrl(value: string | null): string | null {
    return value && /^https?:\/\//i.test(value) ? value : null;
  }
}
