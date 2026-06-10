import pino from 'pino';
import { config } from '../config.js';

/**
 * Logger estructurado compartido por toda la app.
 * En desarrollo usa pino-pretty para una salida legible y coloreada.
 */
export const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
});
