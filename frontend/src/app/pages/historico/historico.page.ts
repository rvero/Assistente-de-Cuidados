import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-historico',
  imports: [IonContent],
  styleUrls: ['../directory.scss'],
  template: `<ion-content
    ><main class="app-shell directory-screen">
      <header class="directory-header">
        <h1>Histórico de transações</h1>
        <p>Acompanhe as movimentações da sua conta.</p>
      </header>
      <div class="page-body">
        <section class="content-card empty-state">
          <h2>Nenhuma transação registrada</h2>
          <p>
            Os pagamentos ainda não estão disponíveis no aplicativo. Quando esse serviço estiver ativo, suas transações
            aparecerão aqui.
          </p>
        </section>
      </div>
    </main></ion-content
  >`,
})
export class HistoricoPage {}
