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
      { name: 'Command Center', url: 'https://hjalmarmeza.github.io/Meza-Command-Center/' }
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

  // COMANDO: /git (Reporte de Actividad Real)
  if (text === '/git') {
    const gitToken = process.env.GITHUB_PAT;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    try {
      // Obtenemos los 10 repositorios actualizados más recientemente
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=10&sort=updated', {
        headers: { 'Authorization': `token ${gitToken}` }
      });
      const repos = await reposResponse.json();
      
      let gitMsg = '💻 *Historial de Cambios (Últimos 7 días)*\n\n';
      let foundActivity = false;

      for (const repo of repos) {
        const commitsRes = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?since=${sevenDaysAgo}`, {
          headers: { 'Authorization': `token ${gitToken}` }
        });
        const commits = await commitsRes.json();
        
        if (Array.isArray(commits) && commits.length > 0) {
          foundActivity = true;
          gitMsg += `📁 *${repo.name}* (${commits.length})\n`;
          // Listamos los últimos 2 commits de cada repo para no saturar el mensaje
          commits.slice(0, 2).forEach(c => {
            const date = new Date(c.commit.author.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            gitMsg += ` └─ 🕒 ${date}: ${c.commit.message.split('\n')[0].slice(0, 50)}\n`;
          });
          gitMsg += `\n`;
        }
      }

      if (!foundActivity) {
        gitMsg = '💤 *Sin actividad reciente* en los últimos 7 días. ¡Es hora de codear!';
      }

      await sendTelegram(chatId, token, gitMsg, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al sincronizar con el servidor de GitHub.');
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

  // COMANDO: /news [Tema] (Noticias bajo demanda)
  if (text.startsWith('/news')) {
    let q = text.replace('/news', '').trim();
    let isSearch = true;

    if (!q) {
      const defaultQueries = ["Inteligencia+Artificial", "Logística+E-commerce", "Supply+Chain", "Tecnología+Logística", "Automatización"];
      q = defaultQueries[Math.floor(Math.random() * defaultQueries.length)];
      isSearch = false;
    } else {
      q = encodeURIComponent(q);
    }

    const rssUrl = `https://news.google.com/rss/search?q=${q}&hl=es&gl=ES&ceid=ES:es`;
    
    try {
      const res = await fetch(rssUrl);
      const xml = await res.text();
      const items = xml.match(/<item>([\s\S]*?)<\/item>/g)?.slice(0, 5) || [];
      
      let msg = `📰 *${isSearch ? 'Resultados para: ' + decodeURIComponent(q) : 'Radar de Innovación (' + q.replace(/\+/g, ' ') + ')'}*\n\n`;
      
      if (items.length === 0) {
        await sendTelegram(chatId, token, `⚠️ No encontré noticias recientes sobre *${decodeURIComponent(q)}*. Intenta con otro término.`, 'Markdown');
        return res.status(200).send('OK');
      }

      items.forEach(item => {
        const titleMatch = item.match(/<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        
        if (titleMatch) {
          const title = titleMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
          const link = linkMatch ? linkMatch[1] : 'https://news.google.com';
          msg += `🔹 [${title}](${link})\n\n`;
        }
      });
      
      msg += `_Fuente: Google News (ES)_`;
      await sendTelegram(chatId, token, msg, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, '❌ Error al sincronizar con el radar de noticias.');
    }
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

  // COMANDO: /estrategia (Mentoría Táctica)
  if (text === '/estrategia') {
    const frameworks = [
      {
        t: "🚀 *Growth Hacking:* AARRR",
        d: "Adquisición, Activación, Retención, Referencia, Ingresos. ¿En qué etapa estás fallando hoy?"
      },
      {
        t: "🛡️ *Gestión de Crisis:* Matriz de Eisenhower",
        d: "Diferencia lo **Urgente** de lo **Importante**. Si no es importante, delégalo o elíminalo."
      },
      {
        t: "📈 *Escalabilidad:* Ley de Brooks",
        d: "Añadir personal a un proyecto retrasado lo retrasa más. Optimiza procesos antes de contratar."
      },
      {
        t: "🏢 *Cultura Directiva:* High Output Management",
        d: "Un manager solo produce mediante sus equipos. Tu métrica es el ratio de salida de tu unidad."
      }
    ];
    const item = frameworks[Math.floor(Math.random() * frameworks.length)];
    const msg = `🎯 *Protocolo de Mentoría Ejecutiva*\n\n${item.t}\n\n💡 *Acción:* ${item.d}\n\n_Manual táctico para directores._`;
    await sendTelegram(chatId, token, msg, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /id
  if (text === '/id') {
    const vcardUrl = 'https://hjalmarmeza.github.io/vcard/';
    await sendTelegram(chatId, token, `🪪 *Tu Tarjeta Digital Interactiva*\n\n[Ver vCard de Hjalmar Meza](${vcardUrl})`, 'Markdown');
    return res.status(200).send('OK');
  }

  // COMANDO: /trends [País] (Extrae del RSS oficial)
  if (text.startsWith('/trends')) {
    const randomCountries = ['ES', 'MX', 'CO', 'PE', 'AR', 'US'];
    let input = text.replace('/trends', '').trim().toUpperCase();
    
    // Mapeo exhaustivo de nombres comunes a ISO 3166-1 alpha-2
    const isoMap = {
      'PERU': 'PE', 'PERÚ': 'PE', 'ESPAÑA': 'ES', 'ESPANA': 'ES', 'SPAIN': 'ES',
      'MEXICO': 'MX', 'MÉXICO': 'MX', 'COLOMBIA': 'CO', 'ARGENTINA': 'AR', 'ARG': 'AR',
      'CHILE': 'CL', 'ECUADOR': 'EC', 'VENEZUELA': 'VE', 'PANAMA': 'PA', 'PANAMÁ': 'PA',
      'EEUU': 'US', 'USA': 'US', 'ESTADOS UNIDOS': 'US', 'URUGUAY': 'UY', 'GLOBAL': 'US'
    };
    
    const countryCode = isoMap[input] || (input.length === 2 ? input : randomCountries[Math.floor(Math.random() * randomCountries.length)]);
    const rssUrl = `https://trends.google.com/trending/rss?geo=${countryCode}`;

    try {
      // Añadimos User-Agent para evitar bloqueos por parte de Google
      const res = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const xml = await res.text();
      
      // Parsing más robusto: buscamos <item> ignorando mayúsculas/minúsculas y espacios
      const items = xml.match(/<item>[\s\S]*?<\/item>/gi)?.slice(0, 10) || [];
      
      if (items.length === 0) {
        await sendTelegram(chatId, token, `⚠️ No se detectaron tendencias para *${countryCode}*. Google podría estar limitando el acceso temporalmente.`, 'Markdown');
        return res.status(200).send('OK');
      }

      let trendsMsg = `🔥 *Tendencias: ${countryCode}*\n\n`;
      items.forEach(item => {
        const titleMatch = item.match(/<title>(.*?)<\/title>/i);
        const trafficMatch = item.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/i);
        
        if (titleMatch) {
          const title = titleMatch[1].replace('<![CDATA[', '').replace(']]>', '');
          const traffic = trafficMatch ? trafficMatch[1] : 'Directo';
          trendsMsg += `📈 *${title}* (+${traffic})\n`;
        }
      });

      trendsMsg += `\n_Fuente: Google Trends RSS_`;
      await sendTelegram(chatId, token, trendsMsg, 'Markdown');
    } catch (e) {
      await sendTelegram(chatId, token, `❌ Error de enlace con el satélite de tendencias (${countryCode}).`);
    }
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
