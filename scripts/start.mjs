import "dotenv/config";
import bot from "../src/bot.mjs";

// Запуск бота в режиме long-polling
await bot.start();
