import 'dotenv/config';

/**
 * Configuración centralizada del bot, leída desde variables de entorno.
 * No hay secretos hardcodeados: todo viene del archivo .env (ver .env.example).
 */
export const config = {
  platform: (process.env.PLATFORM || 'telegram').toLowerCase(),
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  whatsappAuthDir: process.env.WHATSAPP_AUTH_DIR || './.wa-auth',
  logLevel: process.env.LOG_LEVEL || 'info',

  // IA conversacional (opcional). Si no hay key, el fallback degrada a un
  // mensaje fijo de "no entendí".
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
};
