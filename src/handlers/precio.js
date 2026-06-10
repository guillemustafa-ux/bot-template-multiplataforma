/**
 * /precio <símbolo> — consulta el precio spot en Binance y lo responde formateado.
 * Demuestra integración con una API externa pública (sin auth).
 *
 * Ejemplos: /precio BTC   /precio eth   /precio SOLUSDT
 */
const BINANCE_TICKER = 'https://api.binance.com/api/v3/ticker/price';

export async function precio({ msg, args, adapter }) {
  const simbolo = (args[0] || 'BTC').toUpperCase();
  const par = simbolo.endsWith('USDT') ? simbolo : `${simbolo}USDT`;

  try {
    const res = await fetch(`${BINANCE_TICKER}?symbol=${par}`);
    if (!res.ok) throw new Error(`Binance respondió ${res.status}`);

    const data = await res.json();
    const valor = Number(data.price).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });

    await adapter.sendText(msg.from, `💰 ${par}: $${valor}`);
  } catch (err) {
    adapter.logger.warn({ err: err.message, par }, 'No se pudo obtener el precio');
    await adapter.sendText(
      msg.from,
      `No pude obtener el precio de ${simbolo}. Verificá que el símbolo exista (ej: BTC, ETH, SOL).`,
    );
  }
}
