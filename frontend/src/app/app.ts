import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ChatWidgetComponent } from './pages/cliente/components/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly url = signal(this.router.url);

  constructor() {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) this.url.set(e.urlAfterRedirects);
    });
  }

  mostrarChat = computed(() => {
  const url = this.url().split('?')[0].split('#')[0];
  return this.auth.hasRole('CLIENTE') && (url === '/' || url.startsWith('/cliente'));
});
}