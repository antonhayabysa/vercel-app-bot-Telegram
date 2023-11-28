import { getURL } from "vercel-grammy";
import bot from "../src/bot.mjs";

const { VERCEL_ENV } = process.env;

// Список разрешенных окружений
const allowedEnvs = ["production", "preview"];

// Выход, если окружение не подходит
if (!allowedEnvs.includes(VERCEL_ENV)) {
  console.log(`Окружение "${VERCEL_ENV}" не поддерживается. Процесс завершен.`);
  process.exit(1);
}

// Генерация URL для webhook
const url = getURL({ path: "api/update" });

// Параметры настройки webhook
const options = { };

// Установка webhook
try {
  await bot.api.setWebhook(url, options);
  const webhookInfo = await bot.api.getWebhookInfo();
  console.info("Webhook установлен на URL:", webhookInfo.url);
} catch (error) {
  console.error("Ошибка при установке webhook:", error);
  process.exit(1);
}
