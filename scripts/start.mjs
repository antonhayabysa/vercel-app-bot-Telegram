import 'dotenv/config';
import bot from '../src/bot.mjs';

// Запуск бота в режиме long-polling
// console.log('bot start-------------------');
await bot.init();
// console.log('info', bot.botInfo);
await bot.start();
