import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-member-nav',
  imports: [RouterLink, RouterLinkActive],
  template: ` <nav class="member-nav" aria-label="Navegação da conta">
    <a class="history" routerLink="/historico" routerLinkActive="selected" ariaCurrentWhenActive="page"
      ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
        <path d="M9 7h6M9 11h6M9 15h3" /></svg
      ><span>Histórico</span></a
    >
    @if (auth.usuario()?.role === 'CLIENTE') {
      <a class="activity" routerLink="/busca" routerLinkActive="selected" ariaCurrentWhenActive="page"
        ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" /></svg
        ><span>Buscar</span></a
      >
    } @else {
      <a class="activity" routerLink="/home-cuidador" routerLinkActive="selected" ariaCurrentWhenActive="page"
        ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5" /></svg
        ><span>Contatos</span></a
      >
    }
    <a class="options" routerLink="/opcoes" routerLinkActive="selected" ariaCurrentWhenActive="page"
      ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <path
          d="m9 3-.6 2.2-2 .9-2-.6-2 3.5L4 10.6v2.8L2.4 15l2 3.5 2-.6 2 .9L9 21h4l.6-2.2 2-.9 2 .6 2-3.5-1.6-1.6v-2.8L19.6 9l-2-3.5-2 .6-2-.9L13 3H9Z"
        />
        <circle cx="11" cy="12" r="3" /></svg
      ><span>Opções</span></a
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
        color: #f2f6f5;
        font-size: 12px;
        font-weight: bold;
      }
      svg {
        width: 26px;
        height: 26px;
      }
      .history svg {
        color: #ffc18a;
      }
      .activity svg {
        color: #f2f6f5;
      }
      .options svg {
        color: #d3c6ff;
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
}
