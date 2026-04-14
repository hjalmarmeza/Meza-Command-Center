const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

module.exports = async function (req, res) {
    // Respuesta rápida a Vercel
    if (req.method !== 'POST') return res.status(200).send('Bot Status: Online');
    
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).send('OK');

    const chatId = message.chat.id;
    const text = message.text.toLowerCase().trim();

    // --- COMANDOS BLINDADOS (Siempre funcionan) ---
    if (text === '/id') {
        await sendTelegramMessage(chatId, `🆔 Tu Chat ID es: \`${chatId}\`\n(Cópialo y pégalo aquí)`);
        return res.status(200).send('OK');
    }
    if (text === '/vcard') {
        await sendTelegramMessage(chatId, "📇 *Tu Digital VCard:*\nhttps://hjalmarmeza.github.io/vcard/");
        return res.status(200).send('OK');
    }

    if (text === '/start' || text === '/comandos') {
        await sendTelegramMessage(chatId, "🤖 *SentryMezabot v3.0*\n\nComandos:\n/status - Radar de Proyectos (GitHub)\n/vcard - Mi tarjeta digital\n/qr [url] - Genera un QR\n\n_O simplemente háblame..._");
        return res.status(200).send('OK');
    }

    // --- NUEVO PODER: RADAR DE INFRAESTRUCTURA ---
    if (text === '/status') {
        await sendTelegramMessage(chatId, "🔎 *Escaneando infraestructura de Hjalmar Meza...*");
        const statusReport = await getGitHubStatus();
        await sendTelegramMessage(chatId, statusReport);
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

        const data = await response.json();
        const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar tu mensaje.";
        await sendTelegramMessage(chatId, botResponse);
    } catch (error) {
        console.error("Error en Gemini API:", error);
        await sendTelegramMessage(chatId, "⚠️ Error de conexión con el núcleo de IA.");
    }

    return res.status(200).send('OK');
};

async function getGitHubStatus() {
    if (!GITHUB_TOKEN) return "❌ GITHUB_TOKEN no configurado.";
    try {
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const repos = await response.json();
        if (!Array.isArray(repos)) return "⚠️ Error al conectar con GitHub.";

        const activeRepos = repos.slice(0, 5);
        let report = `🛰 *RADAR DE INFRAESTRUCTURA v3.2*\n\n`;
        activeRepos.forEach(repo => {
            report += `📂 *${repo.name}*\n└ 🕒 Activo: ${new Date(repo.updated_at).toLocaleDateString()}\n└ 🔗 [Ver Repo](${repo.html_url})\n\n`;
        });
        report += `📊 *Total Repos:* ${repos.length}\n✅ *Estado:* Óptimo`;
        return report;
    } catch (e) {
        return "⚠️ Error accediendo al Radar.";
    }
}

async function sendTelegramMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            disable_web_page_preview: false
        })
    });
}
