import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CHAT_WEBHOOK_URL } from '../../../config/chat.config';
import { AuthService } from '../../../services/auth.service';
import { ClienteService } from '../../../services/cliente.service';

interface Mensaje {
  rol: 'bot' | 'user';
  texto: string;
  hora: string;
  enlace?: string;
  guardable?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    @keyframes entrar-chat { from { transform: translateX(100%); } to { transform: none; } }
    .panel-chat { animation: entrar-chat .25s ease-out; }
  `],
  template: `
    <!-- Botón flotante -->
    @if (!abierto()) {
      <button type="button" (click)="abierto.set(true)" aria-label="Abrir chat"
        class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-neutral-950 shadow-[0_0_25px_rgba(250,204,21,0.45)] transition hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h8M8 14h5m-9 6 3-3h11a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z" />
        </svg>
      </button>
    }

    <!-- Panel lateral -->
    @if (abierto()) {
      <aside class="panel-chat fixed right-0 top-0 z-50 flex h-full w-full flex-col border-l border-yellow-500/30 bg-neutral-950 text-white shadow-2xl sm:w-100">

        <!-- Encabezado -->
        <header class="flex items-center justify-between border-b-2 border-yellow-400 bg-neutral-900 px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,0.4)]">
              <span class="text-lg font-black text-neutral-950">G</span>
            </div>
            <div>
              <p class="font-bebas text-lg leading-none tracking-widest">GOLD'S GYM</p>
              <p class="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-yellow-400">ASISTENTE VIRTUAL</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" (click)="nuevaConversacion()" title="Nueva conversación"
              class="rounded-md p-2 text-neutral-400 transition hover:bg-yellow-400/10 hover:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M5.6 15A8 8 0 0 0 20 12M18.4 9A8 8 0 0 0 4 12" />
              </svg>
            </button>
            <button type="button" (click)="abierto.set(false)" title="Cerrar"
              class="rounded-md p-2 text-neutral-400 transition hover:bg-yellow-400/10 hover:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </header>

        <!-- Mensajes -->
        <div #lista class="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          @for (m of mensajes(); track $index) {
            @if (m.rol === 'bot') {
              <div class="flex items-end gap-2">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400">
                  <span class="text-xs font-black text-neutral-950">G</span>
                </div>
                <div class="max-w-[80%]">
                  <p class="mb-1 text-[10px] text-neutral-500">Asistente virtual</p>
                  <div class="whitespace-pre-line rounded-2xl rounded-bl-sm bg-neutral-800 px-3.5 py-2.5 text-sm leading-relaxed text-neutral-100">{{ m.texto }}</div>
                  @if (m.enlace) {
                    <a [routerLink]="m.enlace"
                      class="mt-2 inline-block rounded-full border border-yellow-400/60 bg-yellow-400/10 px-3.5 py-1.5 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-400 hover:text-neutral-950">
                      Ver mis rutinas →
                    </a>
                  }
                  @if (m.guardable) {
                    <button type="button" (click)="guardarManual(m)"
                      class="mt-2 inline-block rounded-full border border-yellow-400/60 bg-yellow-400/10 px-3.5 py-1.5 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-400 hover:text-neutral-950">
                      Guardar en Mis rutinas
                    </button>
                  }
                  <p class="mt-1 text-right text-[10px] text-neutral-500">{{ m.hora }}</p>
                </div>
              </div>
            } @else {
              <div class="flex justify-end">
                <div class="max-w-[80%]">
                  <div class="whitespace-pre-line rounded-2xl rounded-br-sm bg-yellow-400 px-3.5 py-2.5 text-sm font-medium text-neutral-950">{{ m.texto }}</div>
                  <p class="mt-1 text-right text-[10px] text-neutral-500">{{ m.hora }}</p>
                </div>
              </div>
            }
          }

          @if (escribiendo()) {
            <div class="flex items-end gap-2">
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400">
                <span class="text-xs font-black text-neutral-950">G</span>
              </div>
              <div class="flex gap-1 rounded-2xl rounded-bl-sm bg-neutral-800 px-4 py-3">
                <span class="h-2 w-2 animate-bounce rounded-full bg-yellow-400"></span>
                <span class="h-2 w-2 animate-bounce rounded-full bg-yellow-400 [animation-delay:150ms]"></span>
                <span class="h-2 w-2 animate-bounce rounded-full bg-yellow-400 [animation-delay:300ms]"></span>
              </div>
            </div>
          }
        </div>

        <!-- Entrada -->
        <footer class="border-t border-yellow-500/20 bg-neutral-900 p-3">
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Escribe aquí..." maxlength="500"
              [value]="entrada()"
              (input)="entrada.set($any($event.target).value)"
              (keydown.enter)="enviar(entrada())"
              class="flex-1 rounded-full border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-yellow-400" />
            <button type="button" (click)="enviar(entrada())"
              [disabled]="!entrada().trim() || escribiendo()"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-neutral-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.4 20.4 22 12 3.4 3.6 3.3 10l13 2-13 2z" />
              </svg>
            </button>
          </div>
        </footer>
      </aside>
    }
  `,
})
export class ChatWidgetComponent {
  private readonly auth = inject(AuthService);
  private readonly cliente = inject(ClienteService);
  private readonly lista = viewChild<ElementRef<HTMLDivElement>>('lista');

  private readonly clave = `gym_chat_${this.auth.nombreVisible()}`;
  private sessionId = crypto.randomUUID();

  abierto = signal(false);
  entrada = signal('');
  escribiendo = signal(false);
  mensajes = signal<Mensaje[]>([]);

  constructor() {
    this.restaurar();

    // Guarda la conversación mientras dure la pestaña
    effect(() => {
      const mensajes = this.mensajes();
      try {
        sessionStorage.setItem(this.clave, JSON.stringify({ sessionId: this.sessionId, mensajes }));
      } catch { /* sin almacenamiento disponible */ }
    });

    // Baja el scroll al último mensaje
    effect(() => {
      this.mensajes();
      this.escribiendo();
      this.abierto();
      setTimeout(() => {
        const el = this.lista()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  async enviar(texto: string): Promise<void> {
    const pregunta = texto.trim();
    if (!pregunta || this.escribiendo()) return;

    this.agregar('user', pregunta);
    this.entrada.set('');
    this.escribiendo.set(true);

    try {
      // fetch (y no HttpClient) para no mandar el JWT del gimnasio a n8n
      const res = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: this.sessionId,
          chatInput: pregunta,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const respuesta = this.extraerTexto(await res.text());
      const rutina = this.extraerRutina(respuesta);
      this.agregar(
        'bot',
        respuesta.replace(/\[\[\/?RUTINA\]\]/gi, ''),
        undefined,
        !rutina && this.pareceRutina(respuesta),
      );
      if (rutina) this.guardarRutina(rutina);
    } catch {
      this.agregar('bot', 'Tuve un problema para responder. Intenta de nuevo en unos segundos.');
    } finally {
      this.escribiendo.set(false);
    }
  }

  nuevaConversacion(): void {
    this.sessionId = crypto.randomUUID(); // memoria nueva en n8n
    this.saludar();
  }

  /** Botón de respaldo: guarda la respuesta del bot como rutina cuando el agente omitió los marcadores. */
  guardarManual(m: Mensaje): void {
    this.mensajes.update(lista => lista.map(x => (x === m ? { ...x, guardable: false } : x)));
    this.guardarRutina({ nombre: 'Rutina personalizada', contenido: m.texto.slice(0, 10000) });
  }

  /** Busca el bloque [[RUTINA]] ... [[/RUTINA]] que genera el agente. */
  private extraerRutina(texto: string): { nombre: string; contenido: string } | null {
    const m = texto.match(/\[\[RUTINA\]\]([\s\S]*?)\[\[\/RUTINA\]\]/i);
    if (!m) return null;

    const bloque = m[1].replace(/\*\*/g, '').trim();
    const nombre = (bloque.match(/^\s*nombre\s*:\s*(.+)$/im)?.[1] ?? 'Rutina personalizada')
      .trim()
      .slice(0, 120);
    const contenido = bloque.replace(/^\s*nombre\s*:.*$/im, '').trim().slice(0, 10000);

    return contenido ? { nombre, contenido } : null;
  }

  /** Respaldo: respuesta larga con líneas que empiezan por un día de la semana. */
  private pareceRutina(t: string): boolean {
    return t.length > 250 && /^[\s#*>_-]*(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/im.test(t);
  }

  /** Guarda la rutina en la base de datos; Mis rutinas y el calendario se actualizan solos. */
  private guardarRutina(r: { nombre: string; contenido: string }): void {
    this.cliente.crearRutina(r.nombre, r.contenido).subscribe({
      next: () =>
        this.agregar('bot', '✅ Guardé tu rutina en "Mis rutinas". Ya aparece en tu calendario.', '/cliente/rutinas'),
      error: () =>
        this.agregar('bot', 'No pude guardar la rutina en tu cuenta. Puedes copiarla y crearla desde "Mis rutinas".'),
    });
  }

  private restaurar(): void {
    try {
      const guardado = sessionStorage.getItem(this.clave);
      if (guardado) {
        const datos = JSON.parse(guardado);
        if (datos.sessionId && Array.isArray(datos.mensajes) && datos.mensajes.length) {
          this.sessionId = datos.sessionId;
          this.mensajes.set(datos.mensajes);
          return;
        }
      }
    } catch { /* ignora datos corruptos */ }
    this.saludar();
  }

  private saludar(): void {
    const nombre = this.auth.nombreVisible();
    this.mensajes.set([
      { rol: 'bot', texto: nombre ? `¡Hola ${nombre}! 👋` : '¡Hola! 👋', hora: this.hora() },
      { rol: 'bot', texto: "Soy el asistente virtual de Gold's Gym. Pregúntame sobre nuestros planes, promociones, horarios, ubicación o pídeme una rutina personalizada.", hora: this.hora() },
    ]);
  }

  private agregar(rol: 'bot' | 'user', texto: string, enlace?: string, guardable = false): void {
    const limpio = rol === 'bot' ? texto.replace(/\*\*(.*?)\*\*/g, '$1').trim() : texto;
    this.mensajes.update(m => [...m, { rol, texto: limpio, hora: this.hora(), enlace, guardable }]);
  }

  private hora(): string {
    return new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }

  private extraerTexto(raw: string): string {
    const vacio = 'No tengo una respuesta en este momento.';
    try {
      const json = JSON.parse(raw);
      const d = Array.isArray(json) ? json[0] : json;
      return d?.output ?? d?.text ?? d?.message ?? vacio;
    } catch {
      // Respuesta en streaming (una línea JSON por fragmento)
      const partes = raw
        .split('\n')
        .filter(Boolean)
        .map(l => { try { return JSON.parse(l); } catch { return null; } })
        .filter(x => x?.type === 'item' && typeof x.content === 'string')
        .map(x => x.content as string);
      return partes.join('') || vacio;
    }
  }
}