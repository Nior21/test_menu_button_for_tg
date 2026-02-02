const express = require('express');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// HTML страница для WebApp
app.get('/webapp', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Тестовый WebApp</title>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            body {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 100%;
                text-align: center;
            }
            
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 28px;
            }
            
            p {
                color: #666;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .button {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 50px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.3s, box-shadow 0.3s;
                width: 100%;
            }
            
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            
            .status {
                margin-top: 20px;
                padding: 15px;
                background: #f0f0f0;
                border-radius: 10px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 Тестовый WebApp</h1>
            <p>Это простейший пример WebApp для Telegram. Вы можете расширить его функциональность по своему усмотрению.</p>
            
            <button class="button" onclick="sendData()">
                📨 Отправить данные в Telegram
            </button>
            
            <div class="status" id="status">
                Готов к работе...
            </div>
        </div>

        <script>
            // Инициализация Telegram WebApp
            const tg = window.Telegram.WebApp;
            
            // Расширяем на весь экран
            tg.expand();
            
            // Изменяем цвет заголовка
            tg.setHeaderColor('#667eea');
            
            // Изменяем цвет фона
            tg.setBackgroundColor('#f0f0f0');
            
            // Функция отправки данных
            function sendData() {
                const data = {
                    action: 'test',
                    timestamp: new Date().toISOString(),
                    userId: tg.initDataUnsafe.user?.id,
                    platform: navigator.platform
                };
                
                // Отправляем данные в бота
                tg.sendData(JSON.stringify(data));
                
                // Показываем статус
                document.getElementById('status').innerHTML = 
                    '✅ Данные отправлены!<br>' +
                    'ID пользователя: ' + (tg.initDataUnsafe.user?.id || 'неизвестен') + '<br>' +
                    'Время: ' + new Date().toLocaleTimeString();
                
                // Закрываем WebApp через 2 секунды
                setTimeout(() => {
                    tg.close();
                }, 2000);
            }
            
            // Обновляем статус при загрузке
            document.addEventListener('DOMContentLoaded', () => {
                const status = document.getElementById('status');
                status.innerHTML = 
                    'WebApp загружен!<br>' +
                    'Платформа: ' + navigator.platform + '<br>' +
                    'User ID: ' + (tg.initDataUnsafe.user?.id || 'неизвестен');
            });
        </script>
    </body>
    </html>
    `);
});

// Обработчик команды /start
bot.start(async (ctx) => {
    try {
        // Устанавливаем меню с кнопкой WebApp
        await ctx.telegram.setChatMenuButton({
            chat_id: ctx.chat.id,
            menu_button: {
                type: 'web_app',
                text: 'Открыть WebApp',
                web_app: {
                    url: process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`
                }
            }
        });
        
        // Отправляем приветственное сообщение
        await ctx.reply(
            '👋 Привет! Я тестовый бот с WebApp.\n\n' +
            '📱 Нажмите кнопку "Открыть WebApp" в меню, чтобы открыть интерактивное приложение.\n\n' +
            'Это пример простейшего бота, показывающего возможности Telegram Web Apps.'
        );
    } catch (error) {
        console.error('Error setting menu button:', error);
        await ctx.reply('Произошла ошибка при настройке бота.');
    }
});

// Обработчик данных из WebApp
bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data.json);
        console.log('Received data from WebApp:', data);
        
        await ctx.reply(
            '✅ Данные получены из WebApp!\n\n' +
            `Действие: ${data.action}\n` +
            `Время: ${new Date(data.timestamp).toLocaleString()}\n` +
            `Ваш ID: ${data.userId}\n` +
            `Платформа: ${data.platform}`
        );
    } catch (error) {
        console.error('Error processing web app data:', error);
        await ctx.reply('Ошибка при обработке данных из WebApp.');
    }
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
    await ctx.reply(
        '📱 Используйте кнопку "Открыть WebApp" в меню, чтобы открыть интерактивное приложение.\n\n' +
        'Команды:\n' +
        '/start - Настройка бота\n' +
        '/help - Помощь'
    );
});

// Команда /help
bot.help(async (ctx) => {
    await ctx.reply(
        'ℹ️ **Помощь по боту**\n\n' +
        'Это тестовый бот, демонстрирующий возможности Telegram Web Apps.\n\n' +
        '**Основные функции:**\n' +
        '• Кнопка WebApp в меню\n' +
        '• Интерактивное HTML-приложение\n' +
        '• Обмен данными между WebApp и ботом\n\n' +
        '**Для разработчиков:**\n' +
        '1. WebApp доступен по адресу: ' + (process.env.WEBAPP_URL || '/webapp') + '\n' +
        '2. Исходный код можно расширить для добавления платежей, форм и другого функционала'
    );
});

// Запуск бота
(async () => {
    try {
        // Запускаем вебхук (для продакшена) или поллинг (для разработки)
        if (process.env.NODE_ENV === 'production') {
            const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;
            await bot.telegram.setWebhook(webhookUrl);
            app.use(await bot.createWebhook({ domain: process.env.RENDER_EXTERNAL_HOSTNAME }));
        } else {
            await bot.launch();
            console.log('Бот запущен в режиме поллинга');
        }
        
        app.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`);
            console.log(`WebApp доступен по адресу: http://localhost:${port}/webapp`);
        });
    } catch (error) {
        console.error('Ошибка при запуске бота:', error);
    }
})();

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));