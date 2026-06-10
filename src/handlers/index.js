import { start } from './start.js';
import { help } from './help.js';
import { ping } from './ping.js';
import { precio } from './precio.js';

/**
 * Registra todos los handlers en el router.
 * Agregar un comando nuevo es: crear su archivo y sumar una línea acá.
 */
export function registerHandlers(router) {
  router.command(['start', 'hola', 'menu'], start);
  router.command(['help', 'ayuda'], help);
  router.command('ping', ping);
  router.command('precio', precio);

  router.setFallback(async ({ msg, adapter }) => {
    await adapter.sendText(msg.from, 'No entendí eso 🤔. Escribí /help para ver los comandos.');
  });
}
