import { config } from '../config.js';

/**
 * Servicio de IA conversacional vía Groq (API compatible con OpenAI).
 * Groq es gratis y rápido, y funciona desde Argentina sin restricciones.
 */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT =
  'Sos un asistente conversacional amable y conciso dentro de un bot de mensajería. ' +
  'Respondé en español rioplatense, en pocas frases, con tono cercano y claro. ' +
  'Si no sabés algo, decilo con honestidad en lugar de inventar.';

/** True si hay API key configurada (la feature es opcional). */
export function groqEnabled() {
  return Boolean(config.groqApiKey);
}

/**
 * Envía el texto del usuario a Groq y devuelve la respuesta del modelo.
 * @param {string} userText
 * @returns {Promise<string>}
 */
export async function askGroq(userText) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: config.groqModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Groq respondió ${res.status}: ${detalle.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || 'No tengo una respuesta para eso.';
}
