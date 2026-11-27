import { AppIcon } from './app-icon';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ContratoApi } from '../services/contrato-api';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-member-nav',
  imports: [AppIcon, RouterLink, RouterLinkActive],
  template: ` <nav class="member-nav" aria-label="Navegação da conta">
    <a class="history" routerLink="/historico" routerLinkActive="selected" ariaCurrentWhenActive="page"
      ><app-icon name="history" /><span>Histórico</span></a
    >
    @if (auth.usuario()?.role === 'CLIENTE') {
      <a class="activity" [routerLink]="contratos.atual()?'/contrato':'/busca'" routerLinkActive="selected" ariaCurrentWhenActive="page"
        ><app-icon [name]="contratos.atual()?'contract':'search'" /><span>{{contratos.atual()?'Contrato atual':'Buscar'}}</span></a
      >
    } @else {
      <a class="activity" routerLink="/home-cuidador" routerLinkActive="selected" ariaCurrentWhenActive="page"
        ><app-icon name="people" /><span>Solicitações</span></a
      >
    }
    <a class="options" routerLink="/opcoes" routerLinkActive="selected" ariaCurrentWhenActive="page"
      ><app-icon name="settings" /><span>Opções</span></a
    >
  </nav>`,
  styles: [
    `
      .member-nav {
        position: fixed;
        z-index: 100;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: min(100%, 480px);
        min-height: calc(72px + env(safe-area-inset-bottom));
        padding: 6px 16px calc(6px + env(safe-area-inset-bottom));
        border-radius: 24px 24px 0 0;
        display: flex;
        background: #2f7d6e;
        box-shadow: 0 -4px 24px #1f2a2e16;
      }
      a {
        flex: 1;
        min-height: 60px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border-radius: 16px;
        text-decoration: none;
        color: #ffffff;
        font-size: 12px;
        font-weight: bold;
      }
      app-icon {
        width: 26px;
        height: 26px;
      }
      .history app-icon {
        color: #ffffff;
      }
      .activity app-icon {
        color: #ffffff;
      }
      .options app-icon {
        color: #ffffff;
      }
      a.selected {
        background: #ffffff20;
      }
      a:focus-visible {
        outline: 2px solid white;
        outline-offset: -2px;
      }
    `,
  ],
})
export class MemberNavComponent {
  readonly auth = inject(Auth);
  readonly contratos = inject(ContratoApi);
}
