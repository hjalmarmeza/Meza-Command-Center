const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

module.exports = async function (req, res) {
    if (req.method !== 'POST') return res.status(200).send('Bot Status: Online');
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();

    if (text === '/start' || text === '/comandos') {
        const menu = `🤖 *COMMAND CENTER v3.7*\n\n🛰 *INFRAESTRUCTURA*\n• /status - Radar de GitHub\n• /url - Catálogo Horizon Hub\n\n⚖ *UTILITARIOS*\n• /qr [enlace] - Generar QR\n• /dolar - Tipo de Cambio\n• /clima [ciudad] - Clima Global\n\n💎 *PERFIL*\n• /vcard - Mi tarjeta digital`;
        await sendTelegramMessage(chatId, menu);
        return res.status(200).send('OK');
    }

    if (text.startsWith('/qr')) {
        const urlToConvert = message.text.replace(/\/qr/i, '').trim();
        if (!urlToConvert) {
            await sendTelegramMessage(chatId, "⚠️ Usa: \`/qr https://enlace.com\`");
        } else {
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(urlToConvert)}&color=0a1120&bgcolor=f59e0b`;
            await sendTelegramPhoto(chatId, qrApiUrl, `✅ *QR GENERADO*\n🔗 ${urlToConvert}`);
        }
        return res.status(200).send('OK');
    }

    if (text === '/status') {
        const statusReport = await getGitHubStatus();
        await sendTelegramMessage(chatId, statusReport);
        return res.status(200).send('OK');
    }

    if (text.startsWith('/clima')) {
        const city = text.replace('/clima', '').trim() || 'Salamanca, ES';
        try {
            const resp = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%c+%t+%w+%m`);
            const weather = await resp.text();
            await sendTelegramMessage(chatId, `🌤 *CLIMA EN ${city.toUpperCase()}*\n\n${weather}`);
        } catch (e) {
            await sendTelegramMessage(chatId, "⚠️ Error al consultar el clima.");
        }
        return res.status(200).send('OK');
    }

    if (text === '/dolar') {
        try {
            const resp = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await resp.json();
            const eur = data.rates.EUR.toFixed(2);
            const pen = data.rates.PEN.toFixed(2);
            await sendTelegramMessage(chatId, `💵 *TIPO DE CAMBIO (USD)*\n\n🇪🇺 1 USD = ${eur} EUR\n🇵🇪 1 USD = ${pen} PEN`);
        } catch (e) { await sendTelegramMessage(chatId, "⚠️ Error en divisas."); }
        return res.status(200).send('OK');
    }

    if (text === '/url') {
        const catalog = `🌐 *HORIZON HUB - URLS VERIFICADAS*\n\n` +
                        `🛰 *Geo & Telemetría*\n` +
                        `• [Alerta Vecinal](https://hjalmarmeza.github.io/alertavecinal/)\n` +
                        `• [GeoRadio](https://hjalmarmeza.github.io/GeoRadio/)\n\n` +
                        `🎙️ *Voz & Idiomas*\n` +
                        `• [Talk.Me](https://hjalmarmeza.github.io/talk.me/)\n` +
                        `• [Jardin de Historias](https://hjalmarmeza.github.io/jardindehistorias/)\n\n` +
                        `🎶 *Producción Digital*\n` +
                        `• [MusiChris Studio](https://hjalmarmeza.github.io/MusiChris-Studio/)\n` +
                        `• [MusiChris App](https://hjalmarmeza.github.io/MusiChris-App/)\n\n` +
                        `🤖 *Agentes IA*\n` +
                        `• [Vigilante AI](https://hjalmarmeza.github.io/vigilante-privacidad/)\n` +
                        `• [VoxMind AI](https://hjalmarmeza.github.io/Voxmind_AI/)\n` +
                        `• [FaceCut](https://facecut-625262028782.us-west1.run.app/)\n\n` +
                        `⚖️ *Gestión*\n` +
                        `• [Kopilot](https://hjalmarmeza.github.io/kopilot/)\n` +
                        `• [Restaurante](https://hjalmarmeza.github.io/sistema-restaurante/)\n` +
                        `• [ChartLess](https://hjalmarmeza.github.io/chartless/)\n\n` +
                        `💎 *Centrales*\n` +
                        `• [CV Elite](https://hjalmarmeza.github.io/cv/)\n` +
                        `• [VCard](https://hjalmarmeza.github.io/vcard/)\n\n` +
                        `_Extraído del Horizon Hub Dashboard._`;
        await sendTelegramMessage(chatId, catalog);
        return res.status(200).send('OK');
    }

    if (text === '/vcard') {
        await sendTelegramMessage(chatId, "📇 [Tu Digital VCard](https://hjalmarmeza.github.io/vcard/)");
        return res.status(200).send('OK');
    }

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
    } catch (e) { await sendTelegramMessage(chatId, "⚠️ Fallo en el núcleo de IA."); }

    return res.status(200).send('OK');
};

async function getGitHubStatus() {
    try {
        const resp = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const repos = await resp.json();
        const top = repos.slice(0, 5);
        let r = `🛰 *RADAR v3.7*\n\n`;
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

async function sendTelegramPhoto(chatId, photoUrl, caption) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption: caption, parse_mode: 'Markdown' })
    });
}
