import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { arrowBackOutline, arrowForwardOutline, openOutline, searchOutline, receiptOutline, documentTextOutline, peopleOutline, settingsOutline, chevronBackOutline, chevronForwardOutline, closeOutline, cameraOutline, logoInstagram, logoTiktok } from 'ionicons/icons';
const icons = { back: arrowBackOutline, forward: arrowForwardOutline, external: openOutline, search: searchOutline, history: receiptOutline, contract: documentTextOutline, people: peopleOutline, settings: settingsOutline, previous: chevronBackOutline, next: chevronForwardOutline, close: closeOutline, camera: cameraOutline, instagram: logoInstagram, tiktok: logoTiktok, curriculum: documentTextOutline };
export type AppIconName = keyof typeof icons;
@Component({
  selector: 'app-icon',
  imports: [IonIcon],
  template: `<ion-icon [icon]="icons[name()]" aria-hidden="true" />`,
  styles: [`:host{display:inline-flex;align-items:center;justify-content:center;width:1.5em;height:1.5em;flex-shrink:0;vertical-align:middle}ion-icon{width:100%;height:100%}`],
  host: {'aria-hidden': 'true'},
})
export class AppIcon { readonly name = input.required<AppIconName>(); readonly icons = icons; }

