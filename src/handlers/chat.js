import { askGroq, groqEnabled } from '../services/groq.js';

/**
 * Handler de fallback: cualquier mensaje que no sea un comando conocido
 * se responde con IA conversacional (Groq).
 *
 * Si no hay GROQ_API_KEY configurada, degrada al clásico "no entendí".
 */
export async function chat({ msg, adapter }) {
  if (!groqEnabled()) {
    await adapter.sendText(msg.from, 'No entendí eso 🤔. Escribí /help para ver los comandos.');
    return;
  }

  try {
    const respuesta = await askGroq(msg.text);
    await adapter.sendText(msg.from, respuesta);
  } catch (err) {
    adapter.logger.warn({ err: err.message }, 'Groq falló');
    await adapter.sendText(
      msg.from,
      'Uf, no pude pensar una respuesta en este momento. Probá de nuevo en un ratito.',
    );
  }
}
