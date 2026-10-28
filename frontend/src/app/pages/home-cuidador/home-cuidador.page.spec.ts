import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeCuidadorPage } from './home-cuidador.page';

describe('HomeCuidadorPage', () => {
  let component: HomeCuidadorPage;
  let fixture: ComponentFixture<HomeCuidadorPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
    fixture = TestBed.createComponent(HomeCuidadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
