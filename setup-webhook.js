require('dotenv').config();

async function setupWebhook() {
    const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;

    console.log('Настраиваю вебхук...');
    console.log(`URL вебхука: ${webhookUrl}`);

    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
    const data = await response.json();

    console.log('Результат настройки вебхука:', data);

    if (data.ok) {
        console.log('✅ Вебхук успешно настроен!');
    } else {
        console.log('❌ Ошибка при настройке вебхука:', data.description);
    }
}

setupWebhook().catch(console.error);