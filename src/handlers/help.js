/**
 * /help | ayuda — lista de comandos.
 */
export async function help({ msg, adapter }) {
  const texto = [
    '📖 Comandos:',
    '',
    '  /start o "hola"  — mensaje de bienvenida',
    '  /help o "ayuda"  — esta ayuda',
    '  /ping            — responde "pong" y la latencia',
    '  /precio <símbolo>— precio en vivo, ej: /precio ETH',
    '',
    '💬 Cualquier otro mensaje lo respondo con IA conversacional.',
  ].join('\n');

  await adapter.sendText(msg.from, texto);
}
