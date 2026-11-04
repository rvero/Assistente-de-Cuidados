import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { AccountApi } from '../../services/account-api';
import { accountError } from '../../services/account-error';
import { Auth } from '../../services/auth';
import { cpfValido } from '../../services/cpf';
import { ProfileApi, type CuidadorPerfil } from '../../services/profile-api';

@Component({
  selector: 'app-conta',
  imports: [FormsModule, RouterLink, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea],
  templateUrl: './conta.page.html',
  styleUrls: ['../directory.scss', './conta.page.scss'],
})
export class ContaPage {
  private readonly api = inject(AccountApi);
  private readonly auth = inject(Auth);
  private readonly profiles = inject(ProfileApi);
  readonly profissional = computed(() => this.auth.usuario()?.role === 'CUIDADOR');
  cuidador: CuidadorPerfil = {
    nomeCuidador: '',
    nomeSocial: '',
    genero: '',
    dataNascimento: '',
    descricao: '',
    curriculoUrl: '',
  };
  nome = '';
  email = '';
  cpf = '';
  senhaAtual = '';
  novaSenha = '';
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly falhaCarga = signal(false);
  private version = 0;
  ionViewWillEnter(): void {
    this.senhaAtual = '';
    this.novaSenha = '';
    void this.carregar();
  }
  ionViewWillLeave(): void {
    this.version++;
    this.senhaAtual = '';
    this.novaSenha = '';
  }
  async carregar(): Promise<void> {
    const version = ++this.version;
    this.carregando.set(true);
    this.falhaCarga.set(false);
    this.erro.set('');
    this.sucesso.set('');
    try {
      const [data, profile] = await Promise.all([
        firstValueFrom(this.api.obter()),
        this.profissional() ? firstValueFrom(this.profiles.obterCuidador()) : Promise.resolve(null),
      ]);
      if (version === this.version) {
        this.nome = data.nome;
        this.email = data.email;
        this.cpf = data.cpf ?? '';
        this.cuidador = {
          nomeCuidador: data.nome.slice(0, 150),
          nomeSocial: '',
          genero: '',
          dataNascimento: '',
          descricao: '',
          curriculoUrl: '',
          ...profile,
        };
      }
    } catch (e) {
      if (version === this.version) {
        this.erro.set(accountError(e));
        this.falhaCarga.set(true);
      }
    } finally {
      if (version === this.version) this.carregando.set(false);
    }
  }
  async salvar(form: NgForm): Promise<void> {
    if (this.salvando() || this.carregando() || this.falhaCarga()) return;
    this.erro.set('');
    this.sucesso.set('');
    if (form.invalid || !this.nome.trim()) {
      form.control.markAllAsTouched();
      this.erro.set('Confira os campos e informe sua senha atual para confirmar.');
      return;
    }
    if (!cpfValido(this.cpf)) {
      this.erro.set('Informe um CPF válido.');
      return;
    }
    this.salvando.set(true);
    const version = this.version;
    const sessionToken = this.auth.token;
    try {
      const conta = {
        nome: this.nome.trim(),
        email: this.email.trim().toLowerCase(),
        cpf: this.cpf.replace(/\D/g, ''),
        senhaAtual: this.senhaAtual,
        ...(this.novaSenha ? { novaSenha: this.novaSenha } : {}),
      };
      const response = await firstValueFrom(
        this.profissional()
          ? this.api.salvarCuidador(conta, {
              ...this.cuidador,
              nomeCuidador: this.cuidador.nomeCuidador.trim(),
              nomeSocial: this.cuidador.nomeSocial?.trim() ?? '',
              curriculoUrl: this.cuidador.curriculoUrl?.trim() ?? '',
            })
          : this.api.salvar(conta),
      );
      if (this.auth.token !== sessionToken) return;
      await this.auth.atualizarSessao(response);
      if (version !== this.version) return;
      this.senhaAtual = '';
      this.novaSenha = '';
      this.sucesso.set(this.profissional() ? 'Perfil atualizado.' : 'Dados da conta atualizados.');
    } catch (e) {
      if (version === this.version) this.erro.set(accountError(e));
    } finally {
      this.salvando.set(false);
    }
  }
}
