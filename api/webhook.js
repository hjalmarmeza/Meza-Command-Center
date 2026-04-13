const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

module.exports = async function (req, res) {
    // Respuesta rápida a Vercel
    if (req.method !== 'POST') return res.status(200).send('Bot Status: Online');
    
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();

    // --- COMANDOS BLINDADOS (Siempre funcionan) ---
    if (text === '/vcard') {
        await sendTelegramMessage(chatId, "📇 *Tu Digital VCard:*\nhttps://hjalmarmeza.github.io/vcard/");
        return res.status(200).send('OK');
    }

    if (text === '/start' || text === '/comandos') {
        await sendTelegramMessage(chatId, "🤖 *SentryMezabot v2.5*\n\nComandos:\n/vcard - Mi tarjeta digital\n/qr [url] - Genera un QR\n\n_O simplemente háblame..._");
        return res.status(200).send('OK');
    }

    // --- 2. IA Gemini (Modo Premium) ---
    try {
        if (!GEMINI_API_KEY) throw new Error("Llave no configurada");

        const aiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const aiResponse = await fetch(aiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message.text + " (Responde amable y profesional en español)" }] }]
            })
        });

        const aiData = await aiResponse.json();

        // --- Mejora de Integridad (Skill Flow v3.7) ---
        if (aiData.error) {
            const errorMsg = aiData.error.message || "Error desconocido";
            if (aiData.error.code === 429) {
                return await sendTelegramMessage(chatId, "⚠️ *Límite alcanzado:* Google me pide un respiro. Espera 10 segundos y vuelve a intentar.");
            }
            return await sendTelegramMessage(chatId, `❌ *Google dice:* ${errorMsg}`);
        }

        if (aiData.candidates && aiData.candidates[0]) {
            const candidate = aiData.candidates[0];
            if (candidate.finishReason === 'SAFETY') {
                return await sendTelegramMessage(chatId, "🛡️ *Aviso:* Google ha filtrado esta respuesta por sus políticas de seguridad.");
            }
            await sendTelegramMessage(chatId, candidate.content.parts[0].text);
        } else {
            console.error("Respuesta vacía:", aiData);
            await sendTelegramMessage(chatId, "⏳ *Procesando:* La conexión es lenta o el mensaje es complejo. Inténtalo una vez más.");
        }
    } catch (e) {
        console.error("AI critical failure:", e);
        // No enviamos nada al usuario para no saturar si es un error temporal,
        // pero aseguramos que el servidor responda OK a Telegram.
    }

    return res.status(200).send('OK');
};

async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
        });
    } catch (e) {
        console.error("Telegram Error:", e);
    }
}
