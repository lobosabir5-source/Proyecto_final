import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatWidgetComponent } from './components/chat-widget';

@Component({
  selector: 'app-cliente-shell',
  standalone: true,
  imports: [RouterOutlet, ChatWidgetComponent],
  template: `
    <router-outlet />
    <app-chat-widget />
  `,
})
export class ClienteShellComponent {}