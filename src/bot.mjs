import { Bot, InlineKeyboard } from "grammy";
import { connectToMongoDB, fetchUser } from "../db.mjs";

export const { TELEGRAM_BOT_TOKEN: token } = process.env;
export const bot = new Bot(token);

// Расширенное главное меню
function mainMenu() {
  return new InlineKeyboard()
    .text("Расписание", "schedule")
    .row()
    .text("Мероприятия", "events")
    .row()
    .text("Связь с воспитателями", "contact")
    .row()
    .text("FAQ", "faq")
    .row()
    .text("Оставить отзыв", "feedback");
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
  const name = ctx.from.first_name;
  const userData = await getUserData(userId);

  if (!userData) {
    await fetchUser({
      id: userId,
      name,
      username: ctx.from.username,
    });
  }

  ctx.reply(`Добро пожаловать в меню детского сада, ${name}!`, {
    reply_markup: mainMenu(),
  });
});

// Обработчик команды /user
bot.command("user", async (ctx) => {
  const userId = ctx.from.id;
  const user = await getUserData(userId);

  if (user) {
    ctx.reply(`Информация о пользователе: ${JSON.stringify(user)}`);
  } else {
    ctx.reply("Информация о пользователе не найдена.");
  }
});

// Дополнительные обработчики для новых кнопок
bot.callbackQuery("faq", (ctx) => ctx.reply("Здесь будет информация FAQ..."));
bot.callbackQuery("feedback", (ctx) => ctx.reply("Спасибо за ваш отзыв!"));

// Расширенная обработка текстовых сообщений
bot.on("message:text", (ctx) => {
  const text = ctx.message.text.toLowerCase();

  switch (text) {
    case "как записаться?":
      ctx.reply("Информация о процедуре записи...");
      break;
    case "где нас найти?":
      ctx.reply("Наши контакты и адрес...");
      break;
    // Другие часто задаваемые вопросы
    default:
      ctx.reply("Я вас не понимаю. Используйте команды меню для навигации.");
  }
});
