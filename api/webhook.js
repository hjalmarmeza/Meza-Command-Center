export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST allowed');
  }

  const { message } = req.body;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ALLOWED_CHAT_ID = 7823163854; // ID de Hjalmar Meza

  // Si no hay mensaje o token, salimos
  if (!message || !token) {
    return res.status(200).send('OK');
  }

  const chatId = message.chat.id;
  const text = message.text || '';

  // Bloqueo de seguridad: Solo Hjalmar puede usar el bot
  if (chatId !== ALLOWED_CHAT_ID) {
    await sendTelegram(chatId, token, 'Acceso Denegado. Este sistema es privado y solo responde al Administrador.');
    return res.status(200).send('OK');
  }

  // Comando de Inicio
  if (text === '/start') {
    await sendTelegram(chatId, token, '¡Hola Hjalmar! Bienvenido al Command Center Pro.\nSoy tu centinela digital 24/7.\nEnvíame /comandos para ver todas mis funciones estratégicas.');
    return res.status(200).send('OK');
  }

  // Menú de Comandos (Guía Maestra)
  if (text === '/comandos') {
    const helpMenu = `🤖 *Guía de Mando - Meza Command Center*

*📊 Monitoreo y Salud*
- /stats: Tráfico de tus proyectos (GitHub).
- /health: Estado 'Online' de tus 20 webs.
- /briefing: Reporte diario IA/Divisas/Tráfico.
- /board_report: Informe estratégico semanal.

*🔍 Inteligencia y Estrategia*
- /research [Query]: Buscador de leads y directivos.
- /jobs [Puesto]: Buscador de empleo filtrado (Costo 0).
- /news: Noticias IA y Logística.
- /divisas: Conversor de moneda real (EUR/USD/COP).
- /trends [País]: Lo más hablado hoy (ES/MX/CO).
- /estrategia: Modelos mentales para directivos.

*🛠️ Marca y Activos*
- /short [URL]: Acortador personalizado.
- /qr [URL]: Generador de QR profesional.
- /check_links: Detective de enlaces rotos en CV.
- /huella [Nombre]: Rastreador de reputación online.
- /id: Tu tarjeta digital interactiva.

*💻 Gestión e Infraestructura*
- /tech [Repo]: Auditoría de stack tecnológico.
- /rank: Autoridad SEO de tus sitios.
- /monitor [URL]: Vigilancia de cambios en competencia.
- /audit_all: Seguridad global de tus 20 repos.
- /chatbot_on / _off: Control remoto de tu CV.
- /git: Pulso de código semanal.
- /backup: Descarga segura en .zip.
- /new_project [Nombre]: Crea un repositorio al instante.

---
_Escribe /comandos en cualquier momento para volver aquí_`;

    await sendTelegram(chatId, token, helpMenu, 'Markdown');
    return res.status(200).send('OK');
  }

  // Fallback para comandos no reconocidos
  if (text.startsWith('/')) {
    await sendTelegram(chatId, token, 'Comando no reconocido todavía. Estamos activando los módulos uno a uno. Prueba con /comandos.');
  }

  return res.status(200).send('OK');
}

// Función auxiliar para enviar mensajes a Telegram
async function sendTelegram(chatId, token, text, parseMode = '') {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: parseMode
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error('Error enviando a Telegram:', e);
  }
}
