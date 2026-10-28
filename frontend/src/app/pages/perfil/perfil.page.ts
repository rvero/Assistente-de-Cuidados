import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { authError } from '../../services/auth-error';
import type { FamiliaPerfil, CuidadorPerfil } from '../../services/profile-api';
import { ProfileApi } from '../../services/profile-api';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonInput, IonSelect, IonSelectOption, IonTextarea],
})
export class PerfilPage {
  readonly auth = inject(Auth);
  private readonly api = inject(ProfileApi);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly falhaCarga = signal(false);
  familia: FamiliaPerfil = this.novaFamilia();
  cuidador: CuidadorPerfil = this.novoCuidador();
  private version = 0;
  constructor() {
    effect(() => {
      const user = this.auth.usuario();
      this.version++;
      this.familia = this.novaFamilia();
      this.cuidador = this.novoCuidador();
      if (user) void this.carregar();
    });
  }
  private novaFamilia(): FamiliaPerfil {
    return { nomePaciente: '', dataNascimento: '', finalidade: '', alergias: '', recomendacoes: '' };
  }
  private novoCuidador(): CuidadorPerfil {
    return { nomeCuidador: '', nomeSocial: '', genero: '', dataNascimento: '', descricao: '', curriculoUrl: '' };
  }
  async carregar(): Promise<void> {
    const current = ++this.version;
    const user = this.auth.usuario();
    if (!user) return;
    this.carregando.set(true);
    this.falhaCarga.set(false);
    this.erro.set('');
    this.sucesso.set('');
    try {
      if (user.role === 'CLIENTE') {
        const data = await firstValueFrom(this.api.obterFamilia());
        if (current === this.version) this.familia = { ...this.novaFamilia(), ...data };
      } else {
        const data = await firstValueFrom(this.api.obterCuidador());
        if (current === this.version) this.cuidador = { ...this.novoCuidador(), ...data };
      }
    } catch (error) {
      if (current === this.version) {
        this.erro.set(authError(error, 'perfil'));
        this.falhaCarga.set(true);
      }
    } finally {
      if (current === this.version) this.carregando.set(false);
    }
  }
  async salvar(form: NgForm): Promise<void> {
    if (this.salvando() || this.carregando() || this.falhaCarga()) return;
    this.erro.set('');
    this.sucesso.set('');
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.erro.set('Preencha os campos obrigatórios antes de salvar.');
      return;
    }
    const email = this.auth.usuario()?.email;
    const current = this.version;
    this.salvando.set(true);
    try {
      if (this.auth.usuario()?.role === 'CLIENTE') {
        const data = await firstValueFrom(
          this.api.salvarFamilia({ ...this.familia, nomePaciente: this.familia.nomePaciente.trim() }),
        );
        if (current === this.version) this.familia = data;
      } else {
        const data = await firstValueFrom(
          this.api.salvarCuidador({
            ...this.cuidador,
            nomeCuidador: this.cuidador.nomeCuidador.trim(),
            curriculoUrl: this.cuidador.curriculoUrl?.trim() ?? '',
          }),
        );
        if (current === this.version) this.cuidador = data;
      }
      if (email === this.auth.usuario()?.email && current === this.version) this.sucesso.set('Dados do perfil salvos.');
    } catch (error) {
      if (current !== this.version) return;
      if (error instanceof HttpErrorResponse && error.status === 400) {
        const messages = Object.values(error.error?.errors ?? {})
          .filter((message): message is string => typeof message === 'string')
          .map((message) => message.replace(/[.!?]+$/u, ''));
        this.erro.set(messages.length ? messages.join('. ') + '.' : 'Verifique as datas e os dados preenchidos.');
      } else this.erro.set(authError(error, 'perfil'));
    } finally {
      this.salvando.set(false);
    }
  }
}
