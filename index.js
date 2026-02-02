const express = require('express');
const {
    Telegraf
} = require('telegraf');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Глобальная функция для установки кнопки меню
async function setMenuButton(chatId) {
    try {
        const webAppUrl = process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`;

        await bot.telegram.setChatMenuButton({
            chat_id: chatId,
            menu_button: {
                type: 'web_app',
                text: '🚀 Открыть WebApp',
                web_app: {
                    url: webAppUrl
                }
            }
        });
        console.log(`✅ Кнопка меню установлена для чата: ${chatId}`);
        return true;
    } catch (error) {
        console.error(`❌ Ошибка установки кнопки для ${chatId}:`, error.message);
        return false;
    }
}

// HTML страница для WebApp
app.get('/webapp', (req, res) => {
    const webAppHtml = `
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
                margin: 10px 0;
            }
            
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
            }
            
            .button.secondary {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            }
            
            .status {
                margin-top: 20px;
                padding: 15px;
                background: #f0f0f0;
                border-radius: 10px;
                font-family: monospace;
                font-size: 14px;
            }
            
            .info {
                background: #e3f2fd;
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                text-align: left;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 Тестовый WebApp</h1>
            
            <div class="info">
                <strong>Инструкция:</strong>
                <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Вернитесь в Telegram</li>
                    <li>Нажмите /start чтобы настроить бота</li>
                    <li>Кнопка "Открыть WebApp" появится в меню</li>
                </ol>
            </div>
            
            <p>Это простейший пример WebApp для Telegram. Вы можете расширить его функциональность по своему усмотрению.</p>
            
            <button class="button" onclick="sendData()">
                📨 Отправить тестовые данные
            </button>
            
            <button class="button secondary" onclick="requestContact()">
                📱 Поделиться контактом
            </button>
            
            <div class="status" id="status">
                WebApp загружается...
            </div>
        </div>

        <script>
            // Инициализация Telegram WebApp
            const tg = window.Telegram.WebApp;
            const initData = tg.initDataUnsafe;
            
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
                    userId: initData.user?.id,
                    firstName: initData.user?.first_name,
                    platform: navigator.platform
                };
                
                // Отправляем данные в бота
                tg.sendData(JSON.stringify(data));
                
                // Показываем статус
                document.getElementById('status').innerHTML = 
                    '✅ Данные отправлены!<br>' +
                    'Имя: ' + (initData.user?.first_name || 'неизвестно') + '<br>' +
                    'ID: ' + (initData.user?.id || 'неизвестен') + '<br>' +
                    'Время: ' + new Date().toLocaleTimeString();
                
                // Закрываем WebApp через 3 секунды
                setTimeout(() => {
                    tg.close();
                }, 3000);
            }
            
            // Функция запроса контакта
            function requestContact() {
                tg.requestContact();
            }
            
            // Обработчик контакта
            tg.onEvent('contactReceived', (contact) => {
                document.getElementById('status').innerHTML = 
                    '✅ Контакт получен!<br>' +
                    'Телефон: ' + contact.phone_number + '<br>' +
                    'Имя: ' + (contact.first_name || '') + '<br>' +
                    'Фамилия: ' + (contact.last_name || '');
            });
            
            // Обновляем статус при загрузке
            document.addEventListener('DOMContentLoaded', () => {
                const status = document.getElementById('status');
                let info = '<strong>WebApp загружен!</strong><br>';
                
                if (initData.user) {
                    info += '👤 Пользователь: ' + (initData.user.first_name || '') + ' ' + (initData.user.last_name || '') + '<br>';
                    info += '🆔 ID: ' + initData.user.id + '<br>';
                } else {
                    info += '⚠️ Пользователь не авторизован<br>';
                }
                
                info += '📱 Платформа: ' + navigator.platform + '<br>';
                info += '🌐 Язык: ' + navigator.language;
                
                status.innerHTML = info;
            });
        </script>
    </body>
    </html>
    `;

    res.send(webAppHtml);
});

// Обработчик команды /start - ГЛАВНОЕ!
bot.start(async (ctx) => {
    const chatId = ctx.chat.id;
    const firstName = ctx.from.first_name;

    try {
        // Устанавливаем кнопку меню
        const menuSet = await setMenuButton(chatId);

        let message = `👋 Привет, ${firstName}!\n\n`;

        if (menuSet) {
            message += '✅ <b>Кнопка "Открыть WebApp" добавлена в меню!</b>\n\n';
            message += '📱 <b>Как использовать:</b>\n';
            message += '1. Нажмите на кнопку меню (три точки или полоски)\n';
            message += '2. Выберите "Открыть WebApp"\n';
            message += '3. Откроется интерактивное приложение\n\n';
        } else {
            message += '⚠️ <b>Не удалось добавить кнопку в меню</b>\n\n';
            message += 'Вы все равно можете открыть WebApp по ссылке:\n';
            message += process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`;
        }

        message += '\n💡 <b>Что можно делать в WebApp:</b>\n';
        message += '• Отправлять данные в бота\n';
        message += '• Получать информацию о пользователе\n';
        message += '• Тестировать функционал\n\n';
        message += '🔄 <b>Если кнопка не появилась</b>, перезапустите Telegram или отправьте /start еще раз.';

        await ctx.reply(message, {
            parse_mode: 'HTML'
        });

        // Отправляем второе сообщение с визуальной инструкцией
        await ctx.reply(
            '📍 <b>Где искать кнопку:</b>\n\n' +
            '• В мобильном приложении: три точки в правом верхнем углу\n' +
            '• В десктопной версии: полоски в левом верхнем углу\n' +
            '• Название кнопки: "🚀 Открыть WebApp"\n\n' +
            '<i>Кнопка может не отображаться в некоторых версиях Telegram</i>', {
                parse_mode: 'HTML'
            }
        );

    } catch (error) {
        console.error('Error in /start:', error);
        await ctx.reply(
            '❌ Произошла ошибка при настройке бота.\n\n' +
            'Попробуйте:\n' +
            '1. Перезапустить Telegram\n' +
            '2. Отправить /start еще раз\n' +
            '3. Открыть WebApp напрямую:\n' +
            (process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`)
        );
    }
});

// Команда для принудительной установки кнопки
bot.command('menu', async (ctx) => {
    const menuSet = await setMenuButton(ctx.chat.id);

    if (menuSet) {
        await ctx.reply(
            '✅ <b>Кнопка меню установлена!</b>\n\n' +
            'Проверьте меню чата (три точки или полоски).\n' +
            'Если не видите кнопку, попробуйте:\n' +
            '• Перезапустить Telegram\n' +
            '• Отправить /start\n' +
            '• Подождать несколько секунд', {
                parse_mode: 'HTML'
            }
        );
    } else {
        await ctx.reply(
            '❌ <b>Не удалось установить кнопку меню</b>\n\n' +
            'Возможные причины:\n' +
            '• Ограничения Telegram API\n' +
            '• Устаревшая версия Telegram\n' +
            '• Технические проблемы\n\n' +
            'Попробуйте позже или используйте прямую ссылку:\n' +
            (process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`), {
                parse_mode: 'HTML'
            }
        );
    }
});

// Обработчик данных из WebApp
bot.on('web_app_data', async (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data.json);
        console.log('📥 Получены данные из WebApp:', data);

        const firstName = ctx.from.first_name || 'Пользователь';

        await ctx.reply(
            `📋 <b>Данные от ${firstName}:</b>\n\n` +
            `📅 Действие: <code>${data.action || 'не указано'}</code>\n` +
            `🕐 Время: <code>${new Date(data.timestamp).toLocaleString('ru-RU')}</code>\n` +
            `🆔 ID: <code>${data.userId || 'неизвестен'}</code>\n` +
            `📱 Платформа: <code>${data.platform || 'неизвестна'}</code>\n\n` +
            '✅ Данные успешно получены ботом!', {
                parse_mode: 'HTML'
            }
        );

    } catch (error) {
        console.error('Error processing web app data:', error);
        await ctx.reply('❌ Ошибка при обработке данных из WebApp.');
    }
});

// Обработчик контакта из WebApp
bot.on('contact', async (ctx) => {
    const contact = ctx.message.contact;

    await ctx.reply(
        '📱 <b>Контакт получен!</b>\n\n' +
        `👤 Имя: ${contact.first_name || ''} ${contact.last_name || ''}\n` +
        `📞 Телефон: ${contact.phone_number}\n` +
        `🆔 ID: ${contact.user_id || 'не указан'}\n\n` +
        '✅ Контакт успешно сохранен!', {
            parse_mode: 'HTML'
        }
    );
});

// Обработчик текстовых сообщений
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    await ctx.reply(
        '💡 <b>Используйте команды:</b>\n\n' +
        '/start - Настроить бота и добавить кнопку WebApp\n' +
        '/menu - Принудительно установить кнопку меню\n' +
        '/help - Помощь по использованию\n\n' +
        '📱 <b>Главная фишка:</b>\n' +
        'После /start в меню чата появится кнопка "🚀 Открыть WebApp"', {
            parse_mode: 'HTML'
        }
    );
});

// Команда /help
bot.help(async (ctx) => {
    await ctx.reply(
        'ℹ️ <b>Помощь по боту</b>\n\n' +

        '🎯 <b>Как начать:</b>\n' +
        '1. Отправьте /start\n' +
        '2. Бот добавит кнопку в меню чата\n' +
        '3. Нажмите "🚀 Открыть WebApp" в меню\n\n' +

        '📍 <b>Где найти меню:</b>\n' +
        '• Телефон: три точки ⋮ вверху справа\n' +
        '• Компьютер: три полоски ☰ вверху слева\n\n' +

        '🔄 <b>Если кнопки нет:</b>\n' +
        '• Отправьте /menu\n' +
        '• Перезапустите Telegram\n' +
        '• Обновите до последней версии\n\n' +

        '🔧 <b>Прямая ссылка на WebApp:</b>\n' +
        (process.env.WEBAPP_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webapp`) + '\n\n' +

        '📞 <b>Поддержка:</b>\n' +
        'Для вопросов и предложений', {
            parse_mode: 'HTML'
        }
    );
});

// Настройка вебхука
if (process.env.NODE_ENV === 'production') {
    app.use(express.json());

    // Маршрут для вебхука Telegram
    app.post(`/webhook`, async (req, res) => {
        try {
            await bot.handleUpdate(req.body);
            res.sendStatus(200);
        } catch (error) {
            console.error('Error handling update:', error);
            res.sendStatus(500);
        }
    });

    // Главная страница
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Telegram WebApp Bot</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                    }
                    .status {
                        background: #4CAF50;
                        color: white;
                        padding: 15px;
                        border-radius: 10px;
                        text-align: center;
                        font-weight: bold;
                        margin-bottom: 30px;
                    }
                    .card {
                        background: #f5f5f5;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                    }
                    .button {
                        display: inline-block;
                        background: #667eea;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 5px;
                        text-decoration: none;
                        font-weight: bold;
                        margin: 10px 5px;
                    }
                    .button:hover {
                        background: #5a67d8;
                    }
                    .instructions {
                        background: #e3f2fd;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 30px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🤖 Telegram WebApp Bot</h1>
                    <p>Демонстрационный бот с кнопкой WebApp в меню</p>
                </div>
                
                <div class="status">✅ Сервер работает! Бот активен.</div>
                
                <div class="card">
                    <h2>🔗 Ссылки</h2>
                    <a href="/webapp" class="button">🌐 Открыть WebApp</a>
                    <a href="https://t.me/${process.env.BOT_USERNAME}" class="button">💬 Открыть в Telegram</a>
                </div>
                
                <div class="instructions">
                    <h2>📋 Инструкция по использованию</h2>
                    <ol>
                        <li>Откройте бота в Telegram</li>
                        <li>Отправьте команду <strong>/start</strong></li>
                        <li>Бот добавит кнопку "🚀 Открыть WebApp" в меню чата</li>
                        <li>Нажмите на кнопку меню (⋮ или ☰)</li>
                        <li>Выберите "Открыть WebApp"</li>
                    </ol>
                </div>
                
                <div class="card">
                    <h2>🛠 Техническая информация</h2>
                    <p><strong>WebHook URL:</strong> /webhook</p>
                    <p><strong>WebApp URL:</strong> /webapp</p>
                    <p><strong>Порт:</strong> ${port}</p>
                    <p><strong>Режим:</strong> ${process.env.NODE_ENV}</p>
                </div>
            </body>
            </html>
        `);
    });

} else {
    // Режим разработки
    bot.launch().then(() => {
        console.log('🤖 Бот запущен в режиме поллинга');
    }).catch(console.error);
}

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
    console.log(`🌐 WebApp доступен по адресу: http://localhost:${port}/webapp`);

    if (process.env.NODE_ENV === 'production') {
        console.log(`🔗 Вебхук настроен на: /webhook`);
        console.log(`📞 Для настройки выполните:`);
        console.log(`curl -X POST https://api.telegram.org/bot${process.env.BOT_TOKEN}/setWebhook?url=https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`);
    }
});

// Обработка завершения
process.once('SIGINT', () => {
    console.log('🛑 Остановка бота...');
    bot.stop('SIGINT');
    process.exit(0);
});

process.once('SIGTERM', () => {
    console.log('🛑 Остановка бота...');
    bot.stop('SIGTERM');
    process.exit(0);
});