import { Bot, InlineKeyboard } from "grammy";

export const {
  TELEGRAM_BOT_TOKEN: token,
  TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop(),
} = process.env;

export const bot = new Bot(token);

// Функция для создания главного меню
function mainMenu() {
  return new InlineKeyboard()
    .text("Расписание", "schedule")
    .row()
    .text("Мероприятия", "events")
    .row()
    .text("Связь с воспитателями", "contact");
}

// Обработчик команды /start
bot.command("start", (ctx) => {
  console.log(ctx.message);
  ctx.reply("Добро пожаловать в меню детского сада!", {
    reply_markup: mainMenu(),
  });
});

// Обработчики для каждой кнопки
bot.callbackQuery("schedule", (ctx) =>
  ctx.reply("Здесь будет информация о расписании...")
);
bot.callbackQuery("events", (ctx) =>
  ctx.reply("Здесь будет информация о мероприятиях...")
);
bot.callbackQuery("contact", (ctx) => ctx.reply("Контакты воспитателей: ..."));

// Расширенная обработка текстовых сообщений
bot.on("message:text", (ctx) => {
  const text = ctx.message.text.toLowerCase();
  if (text.includes("стоимость")) {
    ctx.reply("Стоимость наших услуг составляет...");
  } else if (text.includes("режим работы")) {
    ctx.reply("Мы работаем с 8:00 до 19:00...");
  } else {
    // Ответ по умолчанию, если текст не распознан
    ctx.reply("Я вас не понимаю. Используйте команды меню для навигации.");
  }
});
