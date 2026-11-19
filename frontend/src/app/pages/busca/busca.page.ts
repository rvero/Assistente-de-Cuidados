import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { authError } from '../../services/auth-error';
import { DirectoryApi, type CuidadorPublico } from '../../services/directory-api';

@Component({
  selector: 'app-busca',
  imports: [CurrencyPipe, FormsModule, RouterLink, IonContent, IonButton],
  templateUrl: './busca.page.html',
  styleUrls: ['../directory.scss', './busca.page.scss'],
})
export class BuscaPage {
  private readonly api = inject(DirectoryApi);
  readonly cuidadores = signal<CuidadorPublico[]>([]);
  readonly termo = signal('');
  readonly cidade = signal('');
  readonly valorMax = signal<number | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal('');
  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
  readonly resultados = computed(() => {
    const q = this.normalize(this.termo().trim());
    const city = this.normalize(this.cidade().trim());
    const raw = this.valorMax();
    const max = raw == null || String(raw) === '' ? null : Number(raw);
    return this.cuidadores()
      .filter(
        (c) =>
          this.normalize(c.nome + ' ' + (c.descricao ?? '')).includes(q) &&
          (!city || this.normalize(c.cidade ?? '').includes(city)) &&
          (max === null || (c.valorHora != null && c.valorHora <= max)),
      )
      .sort((a, b) => (a.valorHora ?? Infinity) - (b.valorHora ?? Infinity));
  });
  ionViewWillEnter(): void {
    void this.carregar();
  }
  async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set('');
    try {
      this.cuidadores.set(await firstValueFrom(this.api.cuidadores()));
    } catch (e) {
      this.erro.set(authError(e));
    } finally {
      this.carregando.set(false);
    }
  }
}
