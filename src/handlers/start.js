/**
 * /start | hola | menu — mensaje de bienvenida con el menú de comandos.
 */
export async function start({ msg, adapter }) {
  const texto = [
    '👋 ¡Hola! Soy un bot demo construido sobre un template multiplataforma.',
    '',
    'Comandos disponibles:',
    '  /help    — lista de comandos',
    '  /ping    — verificar que estoy vivo',
    '  /precio  — precio de una cripto, ej: /precio BTC',
    '',
    '💬 También podés escribirme cualquier cosa y te respondo con IA.',
    '',
    `Estás hablando conmigo por: ${msg.platform}.`,
  ].join('\n');

  await adapter.sendText(msg.from, texto);
}
