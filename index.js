// Bot by: Shaad You | 756947441592303707
// Code Nexus: https://discord.gg/Tpwgkj9gzj

const { Client, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: 53608447 });
const { token, api, channel } = require('./config.json');
client.login(token);

const rateLimit = new Map();
const RATE_LIMIT_TIME = 5000; // 5 ثواني
const RATE_LIMIT_COUNT = 3; // خمس طلبات في ثلات ثواني

client.on('ready', () => {
    console.log(`
        ────────────────────────────────────
        ✅ My Name is ${client.user.tag}
        
        🔹 Server: 
        
     ██████╗ ██████╗ ██████╗ ███████╗    ███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗
    ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝
    ██║     ██║   ██║██║  ██║█████╗      ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗
    ██║     ██║   ██║██║  ██║██╔══╝      ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║
    ╚██████╗╚██████╔╝██████╔╝███████╗    ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║
     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
                                                                                    
    
                                                                                                          
                                                                                                          
        🔹 Developer: Shaad You
        🔹 Developer ID: 756947441592303707
        🔹 Server Link: https://discord.gg/XGyMPwedqE
        
        COPYRIGHT © 2025 CODE NEXUS
        ────────────────────────────────────`);
});

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(api);

const messageCache = new Map();
const CACHE_EXPIRY = 60000; // دقيقة

async function run(msg, message) {
    try {
        await message.channel.sendTyping();

        if (messageCache.has(msg)) {
            const cachedResponse = messageCache.get(msg);
            return sendEmbed(message, cachedResponse, true);
        }

        const user = message.author.id;
        if (rateLimit.has(user)) {
            const userData = rateLimit.get(user);
            if (userData.count >= RATE_LIMIT_COUNT && Date.now() - userData.lastRequest < RATE_LIMIT_TIME) {
                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('⚠️ تم تجاوز الحد الأقصى')
                        .setDescription('يرجى الانتظار بضع ثوان قبل تقديم طلب آخر')
                    ]
                });
            }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([msg]);

        if (!result || !result.response || !result.response.text()) {
            throw new Error('Empty response from API');
        }

        const responseText = result.response.text();

        messageCache.set(msg, responseText);
        setTimeout(() => messageCache.delete(msg), CACHE_EXPIRY);

        if (!rateLimit.has(user)) {
            rateLimit.set(user, { count: 1, lastRequest: Date.now() });
        } else {
            const userData = rateLimit.get(user);
            if (Date.now() - userData.lastRequest > RATE_LIMIT_TIME) {
                rateLimit.set(user, { count: 1, lastRequest: Date.now() });
            } else {
                userData.count++;
                userData.lastRequest = Date.now();
            }
        }

        sendEmbed(message, responseText);
    } catch (error) {
        console.error('Error in run function:', error);
        sendErrorEmbed(message, error.message || 'حدث خطأ غير معروف');
    }
}

function sendEmbed(message, content, isCached = false) {
    const randomColor = Math.floor(Math.random() * 16777215);

    const embed = new EmbedBuilder()
        .setColor(randomColor)
        .setDescription(content)
        .setFooter({ text: isCached ? '⚠️ هذه استجابة مخزنة مؤقتًا' : `by ${message.author.username}` });

    message.reply({ embeds: [embed] });
}

function sendErrorEmbed(message, errorMessage) {
    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ خطأ')
        .setDescription(errorMessage);

    message.reply({ embeds: [embed] });
}

client.on('messageCreate', async (message) => {
    if (message.channel.id !== channel) return;
    if (message.author.bot) return;

    const msg = message.content.trim();
    if (!msg) return;

    run(msg, message);
});

// Bot by: Shaad You | 756947441592303707
// Server Support: https://discord.gg/Tpwgkj9gzj