import { config } from './config.js';
import { logger } from './core/logger.js';
import { Router } from './core/router.js';
import { registerHandlers } from './handlers/index.js';
import { TelegramAdapter } from './adapters/TelegramAdapter.js';
import { WhatsAppAdapter } from './adapters/WhatsAppAdapter.js';
import { startQRServer } from './services/qrServer.js';

/**
 * Punto de entrada. Construye el router con los handlers de negocio y
 * arranca uno o ambos adaptadores según la variable PLATFORM.
 */
async function bootstrap() {
  const router = new Router(logger);
  registerHandlers(router);

  const adapters = [];

  if (config.platform === 'telegram' || config.platform === 'both') {
    if (!config.telegramToken) {
      throw new Error('PLATFORM incluye Telegram pero falta TELEGRAM_BOT_TOKEN en .env');
    }
    adapters.push(new TelegramAdapter(config.telegramToken, logger));
  }

  if (config.platform === 'whatsapp' || config.platform === 'both') {
    adapters.push(new WhatsAppAdapter(config.whatsappAuthDir, logger));
    // Servidor web para escanear el QR de WhatsApp (los logs no sirven en cloud).
    startQRServer(config.port);
  }

  if (adapters.length === 0) {
    throw new Error(`PLATFORM inválido: "${config.platform}". Usá telegram, whatsapp o both.`);
  }

  for (const adapter of adapters) {
    adapter.onMessage((msg, a) => router.dispatch(msg, a));
    await adapter.start();
  }

  logger.info({ platform: config.platform }, '🤖 Bot iniciado');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fallo al iniciar el bot');
  process.exit(1);
});
