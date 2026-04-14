const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

module.exports = async function (req, res) {
    if (req.method !== 'POST') return res.status(200).send('Bot Status: Online');
    
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();

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

    // 4. COMANDO /URL (HORIZON HUB)
    if (text === '/url') {
        const catalog = `🌐 *HORIZON HUB - LINKS DIRECTOS*\n\n` +
                        `📌 [Dashboard](https://hjalmarmeza.github.io/Horizon_hub/)\n` +
                        `📄 [CV Elite](https://hjalmarmeza.github.io/cv/)\n` +
                        `🎙️ [Talk.Me](https://hjalmarmeza.github.io/Talk.Me/)\n` +
                        `🎶 [MusiChris](https://hjalmarmeza.github.io/MusiChris/)\n` +
                        `🤖 [Vigilante AI](https://hjalmarmeza.github.io/Vigilante_Privacidad/)\n\n` +
                        `_Acceso instantáneo de producción._`;
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
