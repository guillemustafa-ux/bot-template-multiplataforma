/**
 * Router de comandos agnóstico de plataforma.
 *
 * Mapea la primera palabra del mensaje (con o sin "/") a un handler.
 * Los handlers reciben siempre { msg, args, adapter } y no saben nada
 * de Telegram ni de WhatsApp.
 */
export class Router {
  constructor(logger) {
    this.commands = new Map();
    this.fallback = null;
    this.logger = logger;
  }

  /**
   * Registra un handler para uno o varios nombres de comando.
   * @param {string|string[]} names  ej. 'ping' o ['start', 'hola']
   * @param {Function} handler
   */
  command(names, handler) {
    const list = Array.isArray(names) ? names : [names];
    for (const name of list) {
      this.commands.set(name.toLowerCase(), handler);
    }
    return this;
  }

  /** Handler usado cuando ningún comando coincide. */
  setFallback(handler) {
    this.fallback = handler;
    return this;
  }

  /** Procesa un IncomingMessage y despacha al handler correspondiente. */
  async dispatch(msg, adapter) {
    const text = (msg.text || '').trim();
    if (!text) return;

    const parts = text.split(/\s+/);
    const word = parts[0].toLowerCase();
    const key = word.startsWith('/') ? word.slice(1) : word;
    const args = parts.slice(1);

    const handler = this.commands.get(key) || this.fallback;
    if (!handler) return;

    try {
      await handler({ msg, args, adapter });
    } catch (err) {
      this.logger.error({ err, from: msg.from, platform: msg.platform }, 'Error en handler');
      await adapter.sendText(msg.from, '⚠️ Ocurrió un error procesando tu mensaje. Probá de nuevo.');
    }
  }
}
