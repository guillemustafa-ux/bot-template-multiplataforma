# Bot Template Multiplataforma (Telegram + WhatsApp)

Template reutilizable de bot conversacional en Node.js. La lógica de negocio es
**100% agnóstica de la plataforma**: una capa de adaptadores traduce Telegram y
WhatsApp a un mismo contrato (`MessagingAdapter`), así que los comandos se
escriben una sola vez y corren en cualquiera de las dos.

## ✨ Características

- **Patrón Adapter**: agregar una plataforma nueva = un archivo nuevo.
- **Router de comandos** con soporte de alias y fallback.
- **Comando crypto en vivo** (`/precio`) que consulta Binance — demuestra
  integración con API externa.
- **Logging estructurado** con pino.
- **Reconexión y manejo de errores** (especialmente la sesión de WhatsApp).
- Config por `.env`, sin secretos en el código.

## 🗂️ Estructura

```
src/
├── index.js              # Arranque: construye el router y los adaptadores
├── config.js             # Lee variables de entorno
├── core/
│   ├── MessagingAdapter.js  # Interfaz común a todas las plataformas
│   ├── router.js            # Router de comandos (agnóstico de plataforma)
│   └── logger.js            # Logger pino
├── adapters/
│   ├── TelegramAdapter.js   # Implementación con Telegraf
│   └── WhatsAppAdapter.js   # Implementación con Baileys (multi-device)
└── handlers/
    ├── index.js             # Registro de comandos
    ├── start.js  help.js  ping.js  precio.js
```

El mensaje normalizado que reciben los handlers:

```js
{ from, text, platform, raw }
```

## 🚀 Puesta en marcha (local)

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env     # en Windows PowerShell: copy .env.example .env
   ```
3. Completar `.env` (ver más abajo) y arrancar:
   ```bash
   npm start        # o "npm run dev" para auto-reload
   ```

## ⚙️ Configuración por plataforma

### Telegram
1. Hablá con [@BotFather](https://t.me/BotFather) y creá un bot con `/newbot`.
2. Copiá el token a `TELEGRAM_BOT_TOKEN` en `.env`.
3. Poné `PLATFORM=telegram`.

### WhatsApp
1. Poné `PLATFORM=whatsapp`.
2. Al arrancar, aparece un **QR en la terminal**: escaneálo desde
   WhatsApp → *Dispositivos vinculados*.
3. La sesión se guarda en `WHATSAPP_AUTH_DIR` (por defecto `./.wa-auth`).

> **Si ves `401` / `Bad MAC` / logout:** borrá la carpeta de la sesión
> (`.wa-auth`) y reiniciá para reescanear el QR. Es el reset estándar de Baileys.

### Ambos a la vez
Poné `PLATFORM=both` y completá el token de Telegram. Se levantan los dos
adaptadores compartiendo los mismos handlers.

## ➕ Agregar un comando

1. Creá `src/handlers/miComando.js` exportando una función
   `async ({ msg, args, adapter }) => { ... }`.
2. Registrala en `src/handlers/index.js`:
   ```js
   router.command('micomando', miComando);
   ```

## ☁️ Deploy en Railway

1. Subí el repo a GitHub y creá un proyecto en Railway desde ese repo.
2. En **Variables**, cargá las mismas claves del `.env`
   (`PLATFORM`, `TELEGRAM_BOT_TOKEN`, etc.).
3. Para WhatsApp, montá un **volumen** en la ruta de `WHATSAPP_AUTH_DIR` para
   que la sesión persista entre deploys (si no, hay que reescanear el QR cada vez).
4. Railway corre `npm start` automáticamente.

## 📦 Stack

Node.js ≥18 · Telegraf · @whiskeysockets/baileys · pino · dotenv

## Licencia

MIT
