import { Component, inject, signal } from '@angular/core';
import type { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput } from '@ionic/angular';

import { Auth } from '../../services/auth';
import { authError } from '../../services/auth-error';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [FormsModule, RouterLink, IonButton, IonContent, IonInput],
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  email = '';
  senha = '';
  readonly ocupado = signal(false);
  readonly erro = signal('');
  async entrar(form: NgForm): Promise<void> {
    if (this.ocupado()) return;
    this.erro.set('');
    if (form.invalid || !this.email.trim()) {
      form.control.markAllAsTouched();
      this.erro.set('Informe um e-mail válido e preencha a senha.');
      return;
    }
    this.ocupado.set(true);
    try {
      await this.auth.entrar(this.email, this.senha);
      this.senha = '';
      await this.router.navigateByUrl(this.auth.home, { replaceUrl: true });
    } catch (error) {
      this.erro.set(authError(error));
    } finally {
      this.ocupado.set(false);
    }
  }
  readonly senhaVisivel = signal(false);
  readonly sucesso = signal(this.router.currentNavigation()?.extras.state?.['cadastroConcluido'] === true);
  ionViewWillEnter(): void {
    const state =
      this.router.currentNavigation()?.extras.state ??
      this.router.lastSuccessfulNavigation()?.extras.state ??
      window.history.state;
    this.sucesso.set(state?.['cadastroConcluido'] === true);
    this.erro.set('');
    this.senha = '';
    this.senhaVisivel.set(false);
  }
}
