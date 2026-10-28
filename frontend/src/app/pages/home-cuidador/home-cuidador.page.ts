import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home-cuidador',
  templateUrl: './home-cuidador.page.html',
  styleUrls: ['./home-cuidador.page.scss'],
  imports: [IonButton, IonContent, RouterLink],
})
export class HomeCuidadorPage {
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
