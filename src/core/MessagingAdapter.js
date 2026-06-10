/**
 * Interfaz común a todas las plataformas de mensajería.
 *
 * Cada adaptador (Telegram, WhatsApp, ...) extiende esta clase y traduce
 * los eventos/llamadas específicos de su SDK a este contrato genérico.
 * El core de negocio NUNCA habla con un SDK concreto: solo con esta interfaz.
 *
 * Mensaje normalizado que reciben los handlers (IncomingMessage):
 *   {
 *     from:     string  // identificador del chat/usuario en la plataforma
 *     text:     string  // texto del mensaje
 *     platform: string  // 'telegram' | 'whatsapp'
 *     raw:      object  // objeto original del SDK, por si se necesita
 *   }
 */
export class MessagingAdapter {
  constructor(platform, logger) {
    if (new.target === MessagingAdapter) {
      throw new Error('MessagingAdapter es abstracta: usá una implementación concreta.');
    }
    this.platform = platform;
    this.logger = logger;
  }

  /** Registra el handler que recibirá cada IncomingMessage. */
  onMessage(handler) {
    throw new Error('onMessage() no implementado');
  }

  /** Envía un mensaje de texto a un destinatario. */
  async sendText(to, text) {
    throw new Error('sendText() no implementado');
  }

  /** Envía una imagen (por URL) con caption opcional. */
  async sendImage(to, url, caption) {
    throw new Error('sendImage() no implementado');
  }

  /** Conecta el adaptador y empieza a escuchar mensajes. */
  async start() {
    throw new Error('start() no implementado');
  }
}
