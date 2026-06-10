/**
 * /ping — responde "pong" e informa la latencia del envío.
 */
export async function ping({ msg, adapter }) {
  const inicio = Date.now();
  await adapter.sendText(msg.from, '🏓 pong');
  const ms = Date.now() - inicio;
  await adapter.sendText(msg.from, `Latencia de envío: ${ms} ms`);
}
