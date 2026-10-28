import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonItem, IonRadio, IonRadioGroup } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import type { TipoConta } from '../../services/api';
import { Api } from '../../services/api';
import { authError } from '../../services/auth-error';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonInput, IonItem, IonRadio, IonRadioGroup],
})
export class CadastroPage {
  private readonly router = inject(Router);
  private readonly api = inject(Api);
  email = '';
  senha = '';
  nome = '';
  tipo: TipoConta = 'CLIENTE';
  readonly ocupado = signal(false);
  readonly erro = signal('');
  readonly senhaVisivel = signal(false);
  private readonly route = inject(ActivatedRoute);
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tipo = params.get('tipo') === 'CUIDADOR' ? 'CUIDADOR' : 'CLIENTE';
    });
  }
  ionViewWillEnter(): void {
    this.tipo = this.route.snapshot.queryParamMap.get('tipo') === 'CUIDADOR' ? 'CUIDADOR' : 'CLIENTE';
    this.erro.set('');
    this.senha = '';
    this.senhaVisivel.set(false);
  }
  async cadastrar(form: NgForm): Promise<void> {
    if (this.ocupado()) return;
    this.erro.set('');
    if (form.invalid || !this.email.trim() || !this.nome.trim()) {
      form.control.markAllAsTouched();
      this.erro.set('Informe seu nome, um e-mail válido e uma senha de 6 a 72 caracteres.');
      return;
    }
    this.ocupado.set(true);
    try {
      await firstValueFrom(
        this.api.cadastrar({
          nome: this.nome.trim(),
          email: this.email.trim().toLowerCase(),
          password: this.senha,
          tipo: this.tipo,
        }),
      );
      this.senha = '';
      await this.router.navigateByUrl('/login', { replaceUrl: true, state: { cadastroConcluido: true } });
    } catch (error) {
      this.erro.set(authError(error, 'cadastro'));
    } finally {
      this.ocupado.set(false);
    }
  }
}
