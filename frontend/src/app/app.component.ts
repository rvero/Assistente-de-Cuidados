import { Component, computed, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

import { MemberNavComponent } from './components/member-nav';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, MemberNavComponent],
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private readonly auth = inject(Auth);
  readonly member = computed(() => ['CLIENTE', 'CUIDADOR'].includes(this.auth.usuario()?.role ?? ''));
}
