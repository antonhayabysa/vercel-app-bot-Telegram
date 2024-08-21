import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import {
  findUserInDB,
  addMessageToUser,
  getFAQ,
  getTranslation,
  getDetailAnswer,
  getDirectionAnswer,
  getAvailabilityAnswer,
} from '../db.mjs';

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const userCache = new Map(); // Кэш для хранения данных пользователей

// Функция создания главного меню
async function mainMenu(lang = 'uk') {
  const schedule = await getTranslation('schedule', lang);
  const events = await getTranslation('events', lang);
  const contact = await getTranslation('contact', lang);
  const faq = await getTranslation('faq', lang);
  const feedback = await getTranslation('feedback', lang);
  const services = await getTranslation('services', lang);
  const directions = await getTranslation('directions', lang);
  const availability = await getTranslation('availability', lang);
  const scheduleInfo = await getTranslation('schedule_info', lang);
  const pricing = await getTranslation('pricing', lang);
  const safety = await getTranslation('safety', lang);

  return new InlineKeyboard()
    .text(schedule, 'schedule')
    .text(events, 'events')
    .text(contact, 'contact')
    .row()
    .text(faq, 'faq')
    .text(feedback, 'feedback')
    .row()
    .text(services, 'services')
    .text(directions, 'directions')
    .text(availability, 'availability')
    .row()
    .text(scheduleInfo, 'schedule_info')
    .text(pricing, 'pricing')
    .text(safety, 'safety');
}

// Обработка команды /start
bot.command('start', async (ctx) => {
  const userId = ctx.from.id;
  const name = ctx.from.first_name;
  const username = ctx.from.username;

  let userData = await findUserInDB(userId, name, username);
  userCache.set(userId, userData);

  ctx.reply('Choose your language / Оберіть мову:', {
    reply_markup: { keyboard: languageKeyboard, resize_keyboard: true },
  });
});

// Обработка выбора языка
bot.hears(['🇺🇦 Українська', '🇬🇧 English'], async (ctx) => {
  const selectedLang = ctx.message.text === '🇺🇦 Українська' ? 'uk' : 'en';
  const userId = ctx.from.id;

  userCache.set(userId, { ...userCache.get(userId), lang: selectedLang });
  const welcomeMessage = await getTranslation(
    'correctional_kindergarten_mimi',
    selectedLang
  );

  ctx.reply(`${ctx.from.first_name}, ${welcomeMessage}`, {
    reply_markup: await mainMenu(selectedLang),
  });
});

// Добавляем обработчик для нового раздела "services"
bot.callbackQuery('services', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const servicesData = await getDetailAnswer('services', lang);
  ctx.reply(servicesData || 'Информация недоступна.');
});

// Добавляем обработчик для нового раздела "directions"
bot.callbackQuery('directions', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const directionsData = await getDirectionAnswer('directions', lang);
  ctx.reply(directionsData || 'Информация недоступна.');
});

// Добавляем обработчик для нового раздела "availability"
bot.callbackQuery('availability', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const availabilityData = await getAvailabilityAnswer('availability', lang);
  ctx.reply(availabilityData || 'Информация недоступна.');
});

// Обработка других запросов (FAQ, контактные данные и т.д.)
async function generateFAQMenu(lang) {
  const faqData = await getFAQ();
  const keyboard = new InlineKeyboard();

  for (const faq of faqData) {
    const question = faq.question[lang];
    keyboard.text(question, `faq_${faq._id}`).row(); // Создаем кнопку для каждого вопроса FAQ
  }

  return keyboard;
}

bot.callbackQuery('faq', async (ctx) => {
  const userId = ctx.from.id;
  const lang = userCache.get(userId)?.lang || 'uk';
  const faqKeyboard = await generateFAQMenu(lang);

  ctx.reply(await getTranslation('select_question', lang), {
    reply_markup: faqKeyboard,
  });
});

bot.callbackQuery(/^faq_/, async (ctx) => {
  const faqId = ctx.callbackQuery.data.split('_')[1];
  const faqData = await getFAQ();
  const selectedFAQ = faqData.find((faq) => faq._id.toString() === faqId);

  if (selectedFAQ) {
    const lang = userCache.get(ctx.from.id)?.lang || 'uk';
    const answer = selectedFAQ.answer[lang];

    ctx.reply(answer);
  } else {
    ctx.reply('Извините, информация по этому вопросу не найдена.');
  }
});

// Команда /user для получения информации о пользователе
bot.command('user', async (ctx) => {
  const userId = ctx.from.id;
  const user = await getUserData(userId);

  if (user) {
    ctx.reply(`Информация о пользователе: ${JSON.stringify(user)}`);
  } else {
    ctx.reply('Информация о пользователе не найдена.');
  }
});

// Обработка текстовых сообщений
bot.on('message:text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;
  await addMessageToUser(userId, text);
  const lang = userCache.get(userId)?.lang || 'uk';

  switch (text.toLowerCase()) {
    case 'как записаться?':
      ctx.reply(await getTranslation('how_to_register', lang));
      break;
    case 'где нас найти?':
      ctx.reply(await getTranslation('where_to_find_us', lang));
      break;
    default:
      ctx.reply(await getTranslation('do_not_understand', lang));
  }
});

// Обработка неизвестных команд
bot.on(':text', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  ctx.reply(await getTranslation('do_not_understand', lang));
});

export default bot;
