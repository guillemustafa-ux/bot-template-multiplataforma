import { createServer } from 'http';
import QRCode from 'qrcode';
import { logger } from '../core/logger.js';

/**
 * Servidor HTTP mínimo que sirve el QR de WhatsApp como imagen PNG en una
 * página web. Es el método confiable para vincular en servidores headless
 * (Railway, Fly, VPS): el ASCII en los logs queda demasiado grande/distorsionado
 * para escanear, sobre todo en visores de logs web.
 *
 * La página se auto-recarga cada 20s porque el QR de WhatsApp expira en ~20s.
 */
let currentQR = null;
let connected = false;

/** Guarda el último QR emitido por Baileys. */
export function setQR(qr) {
  currentQR = qr;
  connected = false;
}

/** Marca la sesión como conectada (oculta el QR). */
export function markConnected() {
  currentQR = null;
  connected = true;
}

const page = (body) =>
  `<!doctype html><html lang="es"><head><meta charset="utf-8">` +
  `<meta name="viewport" content="width=device-width,initial-scale=1">` +
  `<title>Vincular WhatsApp</title>` +
  `<style>body{font-family:system-ui,sans-serif;text-align:center;padding:40px;background:#111;color:#eee}` +
  `img{margin:24px auto;border-radius:12px;background:#fff;padding:16px}</style>` +
  `<meta http-equiv="refresh" content="20"></head><body>${body}</body></html>`;

/** Arranca el servidor en el puerto dado (Railway inyecta PORT). */
export function startQRServer(port) {
  createServer(async (_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

    if (connected) {
      res.end(page('<h1>✅ WhatsApp conectado</h1><p>Ya podés cerrar esta página.</p>'));
      return;
    }
    if (!currentQR) {
      res.end(page('<h1>⏳ Esperando QR...</h1><p>La página se recarga sola.</p>'));
      return;
    }

    const img = await QRCode.toDataURL(currentQR, { width: 320, margin: 2 });
    res.end(
      page(
        '<h1>Vincular WhatsApp</h1>' +
          '<p>WhatsApp → Dispositivos vinculados → Vincular un dispositivo</p>' +
          `<img src="${img}" alt="QR de WhatsApp" width="320" height="320">` +
          '<p style="opacity:.6">El QR se renueva cada 20s automáticamente.</p>',
      ),
    );
  }).listen(port, () => {
    logger.info({ port }, 'Servidor de QR de WhatsApp escuchando');
  });
}
