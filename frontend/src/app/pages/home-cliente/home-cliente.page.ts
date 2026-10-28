import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.page.html',
  styleUrls: ['./home-cliente.page.scss'],
  imports: [IonButton, IonContent, RouterLink],
})
export class HomeClientePage {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);
  async sair(): Promise<void> {
    try {
      await this.auth.logout();
    } finally {
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
