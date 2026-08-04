import 'dotenv/config';

/**
 * Configuración centralizada del bot, leída desde variables de entorno.
 * No hay secretos hardcodeados: todo viene del archivo .env (ver .env.example).
 */
// En Linux, dotenv conserva las comillas dobles del .env (TOKEN="abc" → '"abc"'),
// lo que rompe la autenticación de forma silenciosa. Se limpian siempre.
const clean = (v) => (v || '').replace(/"/g, '') || undefined;

const logPretty = clean(process.env.LOG_PRETTY);

export const config = {
  platform: (process.env.PLATFORM || 'telegram').toLowerCase(),
  telegramToken: clean(process.env.TELEGRAM_BOT_TOKEN),
  whatsappAuthDir: process.env.WHATSAPP_AUTH_DIR || './.wa-auth',
  // Puerto del servidor web del QR de WhatsApp. Railway inyecta PORT.
  port: Number(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  // Logs coloreados con pino-pretty. Se apagan solos en producción, donde los
  // agregadores necesitan JSON estructurado. Forzable con LOG_PRETTY=true|false
  // (útil en clouds que no setean NODE_ENV).
  logPretty: logPretty ? logPretty === 'true' : process.env.NODE_ENV !== 'production',

  // IA conversacional (opcional). Si no hay key, el fallback degrada a un
  // mensaje fijo de "no entendí".
  groqApiKey: clean(process.env.GROQ_API_KEY),
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
};
