import { Telegraf } from 'telegraf';
import { MessagingAdapter } from '../core/MessagingAdapter.js';

/**
 * Adaptador de Telegram basado en Telegraf.
 * Traduce los mensajes de texto entrantes al formato IncomingMessage.
 */
export class TelegramAdapter extends MessagingAdapter {
  constructor(token, logger) {
    super('telegram', logger);
    this.bot = new Telegraf(token);
  }

  onMessage(handler) {
    this.bot.on('text', async (ctx) => {
      const msg = {
        from: String(ctx.chat.id),
        text: ctx.message.text,
        platform: 'telegram',
        raw: ctx,
      };
      await handler(msg, this);
    });
  }

  async sendText(to, text) {
    await this.bot.telegram.sendMessage(to, text);
  }

  async sendImage(to, url, caption) {
    await this.bot.telegram.sendPhoto(to, url, caption ? { caption } : undefined);
  }

  async start() {
    // launch() resuelve cuando el bot deja de correr, así que no lo await-eamos.
    this.bot.launch().catch((err) => this.logger.error({ err }, 'Telegram launch falló'));
    this.logger.info('Adaptador de Telegram iniciado');

    // Cierre ordenado ante señales del sistema.
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
  }
}
