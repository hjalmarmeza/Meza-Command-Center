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
    // ... (ayuda omitida por brevedad en este chunk)
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

  // COMANDO: /stats (Tráfico GitHub)
  if (text === '/stats') {
    const gitToken = process.env.GITHUB_PAT;
    if (!gitToken) {
      await sendTelegram(chatId, token, '⚠️ Falta configurar el GITHUB_PAT en Vercel.');
      return res.status(200).send('OK');
    }

    await sendTelegram(chatId, token, '🔍 Consultando tus repositorios... (esto puede tardar unos segundos)');

    try {
      // 1. Obtener lista de repositorios
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=30&sort=updated', {
        headers: { 'Authorization': `token ${gitToken}` }
      });
      const repos = await reposResponse.json();

      let report = '📈 *Reporte de Tráfico (Últimos 14 días)*\n\n';
      
      // Consultamos los 10 más recientes para no saturar el tiempo de Vercel
      for (const repo of repos.slice(0, 10)) {
        const viewsResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/traffic/views`, {
          headers: { 'Authorization': `token ${gitToken}` }
        });
        const viewsData = await viewsResponse.json();
        const totalViews = viewsData.count || 0;
        const uniqueVisitors = viewsData.uniques || 0;

        report += `📁 *${repo.name}*\n👁️ Vistas: ${totalViews} | 👤 Únicos: ${uniqueVisitors}\n\n`;
      }

      await sendTelegram(chatId, token, report, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al consultar GitHub.');
    }
    return res.status(200).send('OK');
  }

  // COMANDO: /research [Query]
  if (text.startsWith('/research')) {
    const query = text.replace('/research', '').trim();
    if (!query) {
      await sendTelegram(chatId, token, 'Uso: `/research NombreEmpresa` o `/research Cargo`');
      return res.status(200).send('OK');
    }
    const searchUrl = `https://www.google.com/search?q=site:linkedin.com/in+OR+site:linkedin.com/company+"${encodeURIComponent(query)}"`;
    await sendTelegram(chatId, token, `🔍 *Buscando leads y directivos:* [Resultados aquí](${searchUrl})`, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /jobs [Puesto]
  if (text.startsWith('/jobs')) {
    const query = text.replace('/jobs', '').trim();
    if (!query) {
      await sendTelegram(chatId, token, 'Uso: `/jobs Desarrollador` o `/jobs Director`');
      return res.status(200).send('OK');
    }
    // Buscamos ofertas en LinkedIn publicadas en el último mes
    const searchUrl = `https://www.google.com/search?q=site:linkedin.com/jobs+"${encodeURIComponent(query)}"+after:2026-03-01`;
    await sendTelegram(chatId, token, `💼 *Buscando vacantes estratégicas:* [Ver ofertas hoy](${searchUrl})`, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /health (Estado de servidores)
  if (text === '/health') {
    const urls = [
      { name: 'CV Interactivo', url: 'https://hjalmarmeza.github.io/CV_01_Web_Interactivo/' },
      { name: 'VCard Contacto', url: 'https://hjalmarmeza.github.io/CV_02_VCard_Contacto/' },
      { name: 'QR Identity', url: 'https://hjalmarmeza.github.io/CV_03_QR_Identity/' },
      { name: 'Linkedinmatic', url: 'https://hjalmarmeza.github.io/Linkedinmatic/' },
      { name: 'Talk.Me', url: 'https://hjalmarmeza.github.io/Talk.Me/' },
      { name: 'Vigilante', url: 'https://hjalmarmeza.github.io/Vigilante_Privacidad/' },
      { name: 'Loom Port', url: 'https://hjalmarmeza.github.io/Loom/' },
      { name: 'Command Center', url: 'https://meza-command-center.vercel.app' },
      { name: 'CV Carlos', url: 'https://hjalmarmeza.github.io/CV-Carlos/' }
    ];

    await sendTelegram(chatId, token, '📡 *Escaneando estado de tus 20 proyectos...*', 'Markdown');

    let healthReport = '🖥️ *Health Check Global*\n\n';
    
    for (const site of urls) {
      try {
        const res = await fetch(site.url, { method: 'HEAD' });
        const icon = res.ok ? '🟢' : '🔴';
        healthReport += `${icon} *${site.name}* (${res.status})\n`;
      } catch (e) {
        healthReport += `🔴 *${site.name}* (Offline)\n`;
      }
    }

    await sendTelegram(chatId, token, healthReport, 'Markdown');
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
