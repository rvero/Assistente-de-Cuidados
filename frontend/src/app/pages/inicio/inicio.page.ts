import { Component, signal, type OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  imports: [IonContent, RouterLink],
})
export class InicioPage implements OnDestroy {
  readonly slides = [
    {
      image: 'assets/inicio/cuidados.jpg',
      alt: 'Atenção e cuidado com a saúde',
    },
    {
      image: 'assets/inicio/infancia.jpg',
      alt: 'Bebê descansando em segurança',
    },
    {
      image: 'assets/inicio/familia.jpg',
      alt: 'Família reunida ao ar livre',
    },
  ];
  readonly activeSlide = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ionViewDidEnter(): void {
    this.startCarousel();
  }

  ionViewWillLeave(): void {
    clearInterval(this.timer);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  selectSlide(index: number): void {
    this.activeSlide.set(index);
  }

  private startCarousel(): void {
    clearInterval(this.timer);
    if (!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.timer = setInterval(() => this.activeSlide.update((index) => (index + 1) % this.slides.length), 6000);
    }
  }
}
