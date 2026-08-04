import test from 'node:test';
import assert from 'node:assert/strict';
import { Router } from './router.js';

/** Logger mínimo que acumula los errores en lugar de imprimirlos. */
function fakeLogger() {
  return { errores: [], error(ctx, mensaje) { this.errores.push({ ctx, mensaje }); } };
}

/**
 * Doble del adaptador. `fallaAlEnviar` simula el caso real de un usuario que
 * bloqueó al bot: la plataforma rechaza el envío.
 */
function fakeAdapter({ fallaAlEnviar = false } = {}) {
  return {
    enviados: [],
    async sendText(to, text) {
      if (fallaAlEnviar) throw new Error('403: bot bloqueado por el usuario');
      this.enviados.push({ to, text });
    },
  };
}

const mensaje = (text) => ({ from: 'u1', text, platform: 'telegram', raw: {} });

test('despacha el comando con y sin barra inicial', async () => {
  const llamados = [];
  const router = new Router(fakeLogger()).command('ping', () => llamados.push('ping'));

  await router.dispatch(mensaje('/ping'), fakeAdapter());
  await router.dispatch(mensaje('ping'), fakeAdapter());

  assert.deepEqual(llamados, ['ping', 'ping']);
});

test('resuelve el comando sin importar mayúsculas', async () => {
  let llamado = false;
  const router = new Router(fakeLogger()).command('Ping', () => { llamado = true; });

  await router.dispatch(mensaje('/PING'), fakeAdapter());

  assert.equal(llamado, true);
});

test('registra todos los alias de un comando', async () => {
  const llamados = [];
  const router = new Router(fakeLogger()).command(['start', 'hola', 'menu'], () => llamados.push(1));

  await router.dispatch(mensaje('/start'), fakeAdapter());
  await router.dispatch(mensaje('hola'), fakeAdapter());
  await router.dispatch(mensaje('/menu'), fakeAdapter());

  assert.equal(llamados.length, 3);
});

test('pasa los argumentos al handler y colapsa los espacios de más', async () => {
  let recibidos = null;
  const router = new Router(fakeLogger()).command('precio', ({ args }) => { recibidos = args; });

  await router.dispatch(mensaje('/precio   btc   usdt'), fakeAdapter());

  assert.deepEqual(recibidos, ['btc', 'usdt']);
});

test('entrega el mensaje y el adaptador al handler', async () => {
  let ctx = null;
  const adapter = fakeAdapter();
  const router = new Router(fakeLogger()).command('ping', (c) => { ctx = c; });

  await router.dispatch(mensaje('/ping'), adapter);

  assert.equal(ctx.msg.from, 'u1');
  assert.equal(ctx.msg.platform, 'telegram');
  assert.equal(ctx.adapter, adapter);
});

test('usa el fallback cuando ningún comando coincide', async () => {
  let textoRecibido = null;
  const router = new Router(fakeLogger())
    .command('ping', () => assert.fail('no debería despachar ping'))
    .setFallback(({ msg }) => { textoRecibido = msg.text; });

  await router.dispatch(mensaje('cualquier cosa suelta'), fakeAdapter());

  assert.equal(textoRecibido, 'cualquier cosa suelta');
});

test('ignora mensajes vacíos, en blanco o sin texto', async () => {
  const router = new Router(fakeLogger()).setFallback(() => assert.fail('no debería despachar'));

  await router.dispatch(mensaje(''), fakeAdapter());
  await router.dispatch(mensaje('    '), fakeAdapter());
  await router.dispatch(mensaje(undefined), fakeAdapter());
});

test('no falla si no hay comando ni fallback registrado', async () => {
  const router = new Router(fakeLogger());

  await router.dispatch(mensaje('/desconocido'), fakeAdapter());
});

test('si el handler falla, avisa al usuario y registra el error', async () => {
  const logger = fakeLogger();
  const adapter = fakeAdapter();
  const router = new Router(logger).command('ping', () => { throw new Error('boom'); });

  await router.dispatch(mensaje('/ping'), adapter);

  assert.equal(adapter.enviados.length, 1);
  assert.match(adapter.enviados[0].text, /Ocurrió un error/);
  assert.equal(logger.errores.length, 1);
});

// Regresión: si el aviso de error también falla (usuario que bloqueó al bot),
// el rechazo no debe propagarse. Propagado, tumbaba el proceso entero por
// unhandledRejection y se caía también la otra plataforma con PLATFORM=both.
test('no propaga cuando el handler falla y el aviso de error también', async () => {
  const logger = fakeLogger();
  const router = new Router(logger).command('ping', () => { throw new Error('boom'); });

  await router.dispatch(mensaje('/ping'), fakeAdapter({ fallaAlEnviar: true }));

  assert.equal(logger.errores.length, 2);
});
