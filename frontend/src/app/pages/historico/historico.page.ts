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
      </header>
      <div class="page-body">
        <section class="content-card empty-state">
          <h2>Nenhuma transação registrada</h2>
        </section>
      </div>
    </main></ion-content
  >`,
})
export class HistoricoPage {}
