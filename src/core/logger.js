import pino from 'pino';
import { config } from '../config.js';

/**
 * Logger estructurado compartido por toda la app.
 *
 * En desarrollo usa pino-pretty para una salida legible y coloreada. En
 * producción emite JSON plano: es lo que los agregadores de logs (Railway, etc.)
 * saben indexar y filtrar, y los códigos de color ensucian sus visores.
 */
export const logger = pino({
  level: config.logLevel,
  ...(config.logPretty && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});
