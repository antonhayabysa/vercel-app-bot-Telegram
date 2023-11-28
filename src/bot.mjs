import { Bot, InlineKeyboard } from "grammy";
import { connectToMongoDB } from "../db.mjs";

export const { TELEGRAM_BOT_TOKEN: token } = process.env;

export const bot = new Bot(token);

function mainMenu() {
  return new InlineKeyboard()
    .text("Расписание", "schedule")
    .row()
    .text("Мероприятия", "events")
    .row()
    .text("Связь с воспитателями", "contact");
}

// Функция для обновления или добавления пользователя в MongoDB
async function fetchUser(data) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("Users");

  await usersCollection.updateOne(
    { id: data.id },
    { $set: data },
    { upsert: true }
  );

  // Получение и возврат данных пользователя
  return await usersCollection.findOne({ id: data.id });
}

// Обработчик команды /start
bot.command("start", async (ctx) => {
  const userData = {
    id: ctx.from.id,
    name: ctx.from.first_name,
    username: ctx.from.username,
  };

  await fetchUser(userData);
  ctx.reply("Добро пожаловать в меню детского сада!", {
    reply_markup: mainMenu(),
  });
});

bot.on("user", async (ctx) => {
  const userId = ctx.from.id; // Получаем ID пользователя, который отправил команду
  const user = await fetchUser({ id: userId }); // Используем fetchUser для получения данных пользователя

  if (user) {
    // Отправляем данные пользователя в ответном сообщении
    ctx.reply(`Информация о пользователе: ${JSON.stringify(user)}`);
  } else {
    ctx.reply("Информация о пользователе не найдена.");
  }
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
    ctx.reply("Я вас не понимаю. Используйте команды меню для навигации.");
  }
});
