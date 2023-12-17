import { Bot, InlineKeyboard, Keyboard } from "grammy";
import {
  findUserInDB,
  addMessageToUser,
  getFAQ,
  getTranslation,
} from "../db.mjs";

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const userCache = new Map();

async function mainMenu(lang = "uk") {
  const schedule = await getTranslation("schedule", lang);
  const events = await getTranslation("events", lang);
  const contact = await getTranslation("contact", lang);
  const faq = await getTranslation("faq", lang);
  const feedback = await getTranslation("feedback", lang);

  return new InlineKeyboard()
    .text(schedule, "schedule")
    .row()
    .text(events, "events")
    .row()
    .text(contact, "contact")
    .row()
    .text(faq, "faq")
    .row()
    .text(feedback, "feedback");
}

async function getUserData(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  const user = await findUserInDB(userId);
  userCache.set(userId, user);
  return user;
}

const languageKeyboard = new Keyboard()
  .text("🇺🇦 Українська")
  .text("🇬🇧 English")
  .resized()
  .build();

bot.command("start", async (ctx) => {
  const userId = ctx.from.id;
  const name = ctx.from.first_name;
  const username = ctx.from.username;

  let userData = await findUserInDB(userId, name, username);
  userCache.set(userId, userData);

  ctx.reply("Choose your language / Оберіть мову:", {
    reply_markup: { keyboard: languageKeyboard, resize_keyboard: true },
  });
});

bot.hears(["🇺🇦 Українська", "🇬🇧 English"], async (ctx) => {
  const selectedLang = ctx.message.text === "🇺🇦 Українська" ? "uk" : "en";
  const userId = ctx.from.id;

  userCache.set(userId, { ...userCache.get(userId), lang: selectedLang });
  const welcomeMessage = await getTranslation("welcome_message", selectedLang);

  ctx.reply(`${welcomeMessage}, ${ctx.from.first_name}!`, {
    reply_markup: await mainMenu(selectedLang),
  });
});

async function generateFAQMenu(lang) {
  const faqData = await getFAQ();
  const keyboard = new InlineKeyboard();

  for (const faq of faqData) {
    const question = await getTranslation(faq.question[lang], lang);
    keyboard.text(question, `faq_${faq._id}`).row();
  }

  return keyboard;
}

bot.callbackQuery("faq", async (ctx) => {
  const userId = ctx.from.id;
  const lang = userCache.get(userId)?.lang || "uk";
  const faqKeyboard = await generateFAQMenu(lang);

  ctx.reply(await getTranslation("select_question", lang), {
    reply_markup: faqKeyboard,
  });
});

bot.callbackQuery(/^faq_/, async (ctx) => {
  const faqId = ctx.callbackQuery.data.split("_")[1];
  const faqData = await getFAQ();
  const selectedFAQ = faqData.find((faq) => faq._id.toString() === faqId);

  if (selectedFAQ) {
    const lang = userCache.get(ctx.from.id)?.lang || "uk";
    const answer = await getTranslation(selectedFAQ.answer[lang], lang);

    ctx.reply(answer);
  } else {
    ctx.reply("Извините, информация по этому вопросу не найдена.");
  }
});

bot.command("user", async (ctx) => {
  const userId = ctx.from.id;
  const user = await getUserData(userId);

  if (user) {
    ctx.reply(`Информация о пользователе: ${JSON.stringify(user)}`);
  } else {
    ctx.reply("Информация о пользователе не найдена.");
  }
});

bot.on("message:text", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  await addMessageToUser(userId, text);
  const lang = userCache.get(userId)?.lang || "uk";

  switch (text.toLowerCase()) {
    case "как записаться?":
      ctx.reply(await getTranslation("how_to_register", lang));
      break;
    case "где нас найти?":
      ctx.reply(await getTranslation("where_to_find_us", lang));
      break;
    default:
      ctx.reply(await getTranslation("do_not_understand", lang));
  }
});

// Обработчик для неизвестных команд
bot.on(":text", async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || "uk";
  ctx.reply(await getTranslation("do_not_understand", lang));
});

export default bot;
