import { AppIcon } from '../../components/app-icon';
import { Component, inject, signal, effect, viewChild } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';

import { accountError } from '../../services/account-error';
import { PatientApi, type Paciente, type ContatoDetalhe } from '../../services/patient-api';

@Component({
  selector: 'app-paciente',
  imports: [AppIcon, FormsModule, RouterLink, IonContent, IonButton, IonInput, IonSelect, IonSelectOption, IonTextarea],
  templateUrl: './paciente.page.html',
  styleUrls: ['../directory.scss'],
})
export class PacientePage {
  private readonly api = inject(PatientApi);
  private readonly route = inject(ActivatedRoute);
  private readonly content = viewChild(IonContent);
  readonly editando = signal(false);
  readonly carregando = signal(true);
  readonly falha = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly sucesso = signal('');
  readonly contato = signal<ContatoDetalhe | null>(null);
  paciente: Paciente = { nomePaciente: '', finalidade: '', alergias: '', recomendacoes: '' };
  private version = 0;
  constructor() {
    effect(() => {
      if (this.erro() || this.sucesso())
        void this.content()?.scrollToTop(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 300);
    });
  }
  ionViewWillEnter(): void {
    this.editando.set(!this.route.snapshot.paramMap.get('id'));
    void this.carregar();
  }
  ionViewWillLeave(): void {
    this.version++;
    this.contato.set(null);
    this.paciente = { nomePaciente: '', finalidade: '', alergias: '', recomendacoes: '' };
  }
  async carregar(): Promise<void> {
    const version = ++this.version;
    this.carregando.set(true);
    this.falha.set(false);
    this.erro.set('');
    this.sucesso.set('');
    try {
      if (this.editando()) {
        const data = await firstValueFrom(this.api.obter());
        if (version === this.version)
          this.paciente = { nomePaciente: '', finalidade: '', alergias: '', recomendacoes: '', ...data };
      } else {
        const data = await firstValueFrom(this.api.contato(this.route.snapshot.paramMap.get('id') ?? ''));
        if (version === this.version) this.contato.set(data);
      }
    } catch (e) {
      if (version === this.version) {
        this.erro.set(accountError(e));
        this.falha.set(true);
      }
    } finally {
      if (version === this.version) this.carregando.set(false);
    }
  }
  async salvar(form: NgForm): Promise<void> {
    if (this.salvando() || this.falha() || !this.editando()) return;
    this.erro.set('');
    this.sucesso.set('');
    if (form.invalid || !this.paciente.nomePaciente.trim()) {
      form.control.markAllAsTouched();
      this.erro.set('Informe o nome do paciente e o motivo do cuidado.');
      return;
    }
    const version = this.version;
    this.salvando.set(true);
    try {
      const data = await firstValueFrom(
        this.api.salvar({ ...this.paciente, nomePaciente: this.paciente.nomePaciente.trim() }),
      );
      if (version === this.version) {
        this.paciente = data;
        this.sucesso.set('Dados do paciente atualizados.');
      }
    } catch (e) {
      if (version === this.version) this.erro.set(accountError(e));
    } finally {
      this.salvando.set(false);
    }
  }
}
