import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { MessagingAdapter } from '../core/MessagingAdapter.js';
import { setQR, markConnected } from '../services/qrServer.js';

/**
 * Adaptador de WhatsApp basado en Baileys (multi-device).
 *
 * Notas operativas (aprendidas en producción):
 *  - printQRInTerminal está deprecado: pintamos el QR a mano con qrcode-terminal.
 *  - Ante 401 / Bad MAC / loggedOut hay que borrar WHATSAPP_AUTH_DIR y reescanear.
 *  - La reconexión automática se intenta salvo que el cierre sea por logout.
 */
export class WhatsAppAdapter extends MessagingAdapter {
  constructor(authDir, logger) {
    super('whatsapp', logger);
    this.authDir = authDir;
    this.sock = null;
    this.handler = null;
  }

  onMessage(handler) {
    this.handler = handler;
  }

  async start() {
    const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({ version, auth: state });

    this.sock.ev.on('creds.update', saveCreds);
    this.sock.ev.on('connection.update', (update) => this._onConnectionUpdate(update));
    this.sock.ev.on('messages.upsert', (payload) => {
      // El emisor de Baileys no maneja rechazos: sin este catch, un sendMessage
      // fallido dentro del handler tumbaría el proceso por unhandledRejection.
      this._onMessages(payload).catch((err) =>
        this.logger.error({ err }, 'Error procesando mensajes de WhatsApp'),
      );
    });
  }

  _onConnectionUpdate({ connection, lastDisconnect, qr }) {
    if (qr) {
      setQR(qr);
      this.logger.info('QR de WhatsApp disponible: abrí la ruta secreta publicada en los logs del servidor de QR.');
    }

    if (connection === 'open') {
      markConnected();
      this.logger.info('Adaptador de WhatsApp conectado');
      return;
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const loggedOut = statusCode === DisconnectReason.loggedOut;
      this.logger.warn({ statusCode }, 'Conexión de WhatsApp cerrada');

      if (loggedOut) {
        this.logger.error(
          `Sesión cerrada (logout). Borrá la carpeta "${this.authDir}" y reiniciá para reescanear el QR.`,
        );
      } else {
        // Con delay para no martillar los servidores de WhatsApp si la falla
        // persiste (reconexión inmediata en loop suele terminar en bloqueo).
        this.logger.info('Reintentando conexión en 3s...');
        setTimeout(() => {
          this.start().catch((err) =>
            this.logger.error({ err }, 'Reconexión de WhatsApp falló'),
          );
        }, 3000);
      }
    }
  }

  async _onMessages({ messages, type }) {
    if (type !== 'notify' || !this.handler) return;

    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;

      const text =
        m.message.conversation || m.message.extendedTextMessage?.text || '';
      if (!text) continue;

      const msg = {
        from: m.key.remoteJid,
        text,
        platform: 'whatsapp',
        raw: m,
      };
      await this.handler(msg, this);
    }
  }

  async sendText(to, text) {
    await this.sock.sendMessage(to, { text });
  }

  async sendImage(to, url, caption) {
    await this.sock.sendMessage(to, { image: { url }, caption });
  }
}
