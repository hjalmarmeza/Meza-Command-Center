const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

module.exports = async function (req, res) {
    if (req.method !== 'POST') return res.status(200).send('Bot Status: Online');
    
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();

    // 0. COMANDO START / COMANDOS
    if (text === '/start' || text === '/comandos') {
        const menu = `🤖 *COMMAND CENTER v3.4*\n\n` +
                     `🛰 *INFRAESTRUCTURA*\n` +
                     `• /status - Radar de GitHub\n` +
                     `• /url - Catálogo Horizon Hub (17)\n\n` +
                     `⚖ *UTILITARIOS PRO*\n` +
                     `• /dolar - Cambio USD / EUR / PEN\n` +
                     `• /clima [ciudad] - Estado del tiempo\n\n` +
                     `💎 *PERFIL*\n` +
                     `• /vcard - Mi tarjeta digital\n\n` +
                     `_O simplemente háblame..._`;
        await sendTelegramMessage(chatId, menu);
        return res.status(200).send('OK');
    }

    // 1. COMANDO /STATUS (RADAR GITHUB)
    if (text === '/status') {
        const statusReport = await getGitHubStatus();
        await sendTelegramMessage(chatId, statusReport);
        return res.status(200).send('OK');
    }

    // 2. COMANDO /CLIMA
    if (text.startsWith('/clima')) {
        const city = text.replace('/clima', '').trim() || 'Salamanca, ES';
        try {
            const resp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%c+%t+%w+%m`);
            const weather = await resp.text();
            await sendTelegramMessage(chatId, `🌤 *CLIMA EN ${city.toUpperCase()}*\n\nResultado: ${weather}`);
        } catch (e) {
            await sendTelegramMessage(chatId, "⚠️ Error al consultar el clima.");
        }
        return res.status(200).send('OK');
    }

    // 3. COMANDO /DOLAR
    if (text === '/dolar') {
        try {
            const resp = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await resp.json();
            const eur = data.rates.EUR.toFixed(2);
            const pen = data.rates.PEN.toFixed(2);
            const update = new Date(data.time_last_update_utc).toLocaleString();
            const msg = `💵 *TIPO DE CAMBIO (USD)*\n\n🇪🇺 1 USD = ${eur} EUR\n🇵🇪 1 USD = ${pen} PEN\n\n📅 _Actualizado: ${update}_`;
            await sendTelegramMessage(chatId, msg);
        } catch (e) {
            await sendTelegramMessage(chatId, "⚠️ Error en divisas.");
        }
        return res.status(200).send('OK');
    }

    // 4. COMANDO /URL (HORIZON HUB - FULL CATALOG)
    if (text === '/url') {
        const catalog = `🌐 *ECOSISTEMA HORIZON HUB (17 PROYECTOS)*\n\n` +
                        `🛰 *Geo & Telemetría*\n` +
                        `• [Alerta Vecinal](https://hjalmarmeza.github.io/Alerta-Vecinal/)\n` +
                        `• [GeoRadio](https://hjalmarmeza.github.io/Georadio/)\n\n` +
                        `🧠 *Inteligencia Artificial & IA*\n` +
                        `• [Vigilante AI](https://hjalmarmeza.github.io/Vigilante_Privacidad/)\n` +
                        `• [MusiChris Studio](https://hjalmarmeza.github.io/MusiChris/)\n` +
                        `• [VoxMind AI](https://hjalmarmeza.github.io/voxmind/)\n\n` +
                        `🎙 *Voz & Idiomas*\n` +
                        `• [Talk.Me](https://hjalmarmeza.github.io/Talk.Me/)\n` +
                        `• [Jardim de Historia](https://hjalmarmeza.github.io/Jardim-de-historia/)\n\n` +
                        `⚖ *Gestión & Negocios*\n` +
                        `• [Kopilot](https://hjalmarmeza.github.io/Kopilot/)\n` +
                        `• [Restaurante360](https://hjalmarmeza.github.io/Restaurant/)\n` +
                        `• [Linkedinmatic](https://hjalmarmeza.github.io/Linkedinmatic/)\n\n` +
                        `🎨 *Moda & Estética*\n` +
                        `• [FaceCut](https://hjalmarmeza.github.io/Facecut/)\n` +
                        `• [Style TARA](https://hjalmarmeza.github.io/Tara/)\n\n` +
                        `🏥 *Salud e Inclusión*\n` +
                        `• [Allimentate](https://hjalmarmeza.github.io/Allimentate/)\n` +
                        `• [MoodWeather](https://hjalmarmeza.github.io/Moodweather/)\n` +
                        `• [Chart Less](https://hjalmarmeza.github.io/chartless/)\n\n` +
                        `🎮 *Interfaces & Control*\n` +
                        `• [Allivision](https://hjalmarmeza.github.io/Allivision/)\n` +
                        `• [HandRacer](https://hjalmarmeza.github.io/Handracer/)\n\n` +
                        `💎 *Centrales*\n` +
                        `• [Horizon Hub Dashboard](https://hjalmarmeza.github.io/Horizon_hub/)\n` +
                        `• [CV Ejecutivo Elite](https://hjalmarmeza.github.io/cv/)\n\n` +
                        `_Acceso total de producción._`;
        await sendTelegramMessage(chatId, catalog);
        return res.status(200).send('OK');
    }

    // 5. COMANDO /VCARD
    if (text === '/vcard') {
        await sendTelegramMessage(chatId, "📇 [Tu Digital VCard](https://hjalmarmeza.github.io/vcard/)");
        return res.status(200).send('OK');
    }

    // FALLBACK: IA GEMINI
    try {
        const aiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const aiResponse = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: message.text }] }] })
        });
        const aiData = await aiResponse.json();
        const botResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar tu mensaje.";
        await sendTelegramMessage(chatId, botResponse);
    } catch (e) {
        await sendTelegramMessage(chatId, "⚠️ Fallo en el núcleo de IA.");
    }

    return res.status(200).send('OK');
};

async function getGitHubStatus() {
    try {
        const resp = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const repos = await resp.json();
        const top = repos.slice(0, 5);
        let r = `🛰 *RADAR v3.2*\n\n`;
        top.forEach(repo => r += `📂 *${repo.name}*\n└ 🔗 [GitHub](${repo.html_url})\n\n`);
        r += `📊 *Total:* ${repos.length}`;
        return r;
    } catch (e) { return "⚠️ Radar offline."; }
}

async function sendTelegramMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown', disable_web_page_preview: false })
    });
}
