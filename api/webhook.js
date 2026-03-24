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

      let report = '📈 *Actividad por Repositorio*\n\n';
      
      for (const repo of repos.slice(0, 10)) {
        const viewsResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/traffic/views`, {
          headers: { 'Authorization': `token ${gitToken}` }
        });
        const viewsData = await viewsResponse.json();
        const totalViews = viewsData.count || 0;
        const uniqueVisitors = viewsData.uniques || 0;

        report += `📁 *${repo.name}*\n👁️ Cod: ${totalViews} | 👤 Únicos: ${uniqueVisitors}\n\n`;
      }

      await sendTelegram(chatId, token, report + '_Nota: Estas son visitas a tu código, no a la web._', 'Markdown');
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
      { name: 'CV Interactivo', url: 'https://hjalmarmeza.github.io/cv/' },
      { name: 'VCard Contacto', url: 'https://hjalmarmeza.github.io/vcard/' },
      { name: 'QR Identity', url: 'https://hjalmarmeza.github.io/qrvcard/' },
      { name: 'Linkedinmatic', url: 'https://hjalmarmeza.github.io/linkedin-ia/' },
      { name: 'Talk.Me', url: 'https://hjalmarmeza.github.io/talk.me/' },
      { name: 'Vigilante', url: 'https://hjalmarmeza.github.io/vigilante-privacidad/' },
      { name: 'Allivisión', url: 'https://hjalmarmeza.github.io/allivision/' },
      { name: 'Restaurante', url: 'https://hjalmarmeza.github.io/sistema-restaurante/' },
      { name: 'Kopilot', url: 'https://hjalmarmeza.github.io/kopilot/' },
      { name: 'Chartless', url: 'https://hjalmarmeza.github.io/chartless/' },
      { name: 'Mediclock', url: 'https://hjalmarmeza.github.io/Mediclock/' },
      { name: 'Handracer', url: 'https://hjalmarmeza.github.io/handracer/' },
      { name: 'Moodweather', url: 'https://hjalmarmeza.github.io/moodweather/' },
      { name: 'Historias', url: 'https://hjalmarmeza.github.io/jardindehistorias/' },
      { name: 'Voxmind AI', url: 'https://hjalmarmeza.github.io/Voxmind_AI/' },
      { name: 'MusiChris', url: 'https://hjalmarmeza.github.io/MusiChris-App/' },
      { name: 'GeoRadio', url: 'https://hjalmarmeza.github.io/GeoRadio/' },
      { name: 'Command Center', url: 'https://meza-command-center.vercel.app/' }
    ];

    await sendTelegram(chatId, token, '📡 *Escaneando estado de tus proyectos...*', 'Markdown');

    let healthReport = '🖥️ *Health Check Global*\n\n';
    
    for (const site of urls) {
      try {
        const fetchRes = await fetch(site.url, { method: 'HEAD' });
        // Command Center devuelve 405 (normal), los demás deben ser 200
        const isOk = fetchRes.ok || (site.name === 'Command Center' && fetchRes.status === 405);
        const icon = isOk ? '🟢' : '🔴';
        healthReport += `${icon} *${site.name}* (${fetchRes.status})\n`;
      } catch (e) {
        healthReport += `🔴 *${site.name}* (Offline)\n`;
      }
    }

    await sendTelegram(chatId, token, healthReport, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /git (Actividad Semanal)
  if (text === '/git') {
    const gitToken = process.env.GITHUB_PAT;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=10&sort=updated', {
        headers: { 'Authorization': `token ${gitToken}` }
      });
      const repos = await reposResponse.json();
      
      let gitMsg = '💻 *Pulso de Código (7 días)*\n\n';
      for (const repo of repos.slice(0, 5)) {
        const commitsRes = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${sevenDaysAgo}`, {
          headers: { 'Authorization': `token ${gitToken}` }
        });
        const commits = await commitsRes.json();
        const count = Array.isArray(commits) ? commits.length : 0;
        gitMsg += `🔹 *${repo.name}*: ${count} commits\n`;
      }
      await sendTelegram(chatId, token, gitMsg, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al consultar actividad Git.');
    }
    return res.status(200).send('OK');
  }

  // COMANDO: /divisas
  if (text === '/divisas') {
    try {
      const resEur = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await resEur.json();
      const usd = data.rates.USD;
      const cop = data.rates.COP;
      const pen = data.rates.PEN;
      const usdToPen = (pen / usd).toFixed(2);

      const msg = `💱 *Mercado de Divisas*\n\n1 EUR ➡️ *${usd}* USD\n1 EUR ➡️ *${cop}* COP\n1 EUR ➡️ *${pen}* PEN\n\n1 USD ➡️ *${usdToPen}* PEN\n\n_Actualizado al instante (Costo 0)_`;
      await sendTelegram(chatId, token, msg, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al consultar divisas.');
    }
    return res.status(200).send('OK');
  }

  // COMANDO: /news
  if (text === '/news') {
    const aiUrl = `https://news.google.com/search?q=Inteligencia+Artificial+Logistica+after:1d&hl=es`;
    const msg = `📰 *Radar de Innovación (Últimas 24h)*\n\n- [Noticias de IA y Logística](${aiUrl})`;
    await sendTelegram(chatId, token, msg, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /qr [URL]
  if (text.startsWith('/qr')) {
    const url = text.replace('/qr', '').trim();
    if (!url) {
      await sendTelegram(chatId, token, 'Uso: `/qr https://tuweb.com`');
      return res.status(200).send('OK');
    }
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=D4AF37&bgcolor=0a1120`;
    await sendTelegram(chatId, token, `🖼️ *Generador de QR Pro*\n\n[Pulsa aquí para ver tu QR](${qrUrl})`, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /tech [Repo]
  if (text.startsWith('/tech')) {
    const repoName = text.replace('/tech', '').trim();
    const gitToken = process.env.GITHUB_PAT;
    if (!repoName) {
      await sendTelegram(chatId, token, 'Uso: `/tech NombreRepo` (ej: cv)');
      return res.status(200).send('OK');
    }

    try {
      const pkgRes = await fetch(`https://api.github.com/repos/${ALLOWED_CHAT_ID === '7823163854' ? 'hjalmarmeza' : ''}/${repoName}/contents/package.json`, {
        headers: { 'Authorization': `token ${gitToken}` }
      });
      if (pkgRes.status === 404) {
        await sendTelegram(chatId, token, '❌ No se encontró el repo o no tiene package.json.');
        return res.status(200).send('OK');
      }
      const pkgData = await pkgRes.json();
      const content = Buffer.from(pkgData.content, 'base64').toString();
      const pkg = JSON.parse(content);
      const deps = Object.keys(pkg.dependencies || {}).join(', ') || 'Ninguna';
      
      await sendTelegram(chatId, token, `💻 *Stack Tecnológico: ${repoName}*\n\n*Dependencias:* ${deps.slice(0, 200)}...`, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al auditar el stack.');
    }
    return res.status(200).send('OK');
  }

  // COMANDO: /estrategia
  if (text === '/estrategia') {
    const modelos = [
      "🧠 *Navaja de Ockham:* La solución más simple suele ser la correcta. Elimina lo innecesario.",
      "📊 *Principio de Pareto (80/20):* El 20% de tus acciones genera el 80% de tus resultados. Identifica ese 20%.",
      "🔄 *Bucle OODA:* Observar, Orientar, Decidir, Actuar. La clave es la velocidad de iteración.",
      "🏗️ *Primeros Principios:* Descompón el problema hasta sus verdades fundamentales y reconstruye desde ahí.",
      "⏳ *Ley de Parkinson:* El trabajo se expande hasta llenar el tiempo disponible. Pon fechas límite cortas."
    ];
    const random = modelos[Math.floor(Math.random() * modelos.length)];
    await sendTelegram(chatId, token, `🎯 *Modelo Mental Estratégico*\n\n${random}`, 'Markdown');
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
