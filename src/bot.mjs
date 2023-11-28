import { Bot, InlineKeyboard } from "grammy";
import { connectToMongoDB, fetchUser } from "../db.mjs";

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

// Кэш для хранения данных пользователей
const userCache = new Map();

async function getUserData(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  const user = await fetchUser(userId);
  userCache.set(userId, user);
  return user;
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
  const userId = ctx.from.id;
  const userData = await getUserData(userId);

  if (!userData) {
    // Если данные о пользователе не найдены в кэше, добавляем пользователя в базу данных
    await fetchUser({
      id: userId,
      name: ctx.from.first_name,
      username: ctx.from.username,
    });
  }

  ctx.reply("Добро пожаловать в меню детского сада!", {
    reply_markup: mainMenu(),
  });
});

// Обработчик команды /user
bot.command("user", async (ctx) => {
  const userId = ctx.from.id;
  const user = await getUserData(userId); // Получаем данные пользователя из кэша или базы данных

  if (user) {
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
