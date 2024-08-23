import { Bot, InlineKeyboard, Keyboard } from 'grammy';
import {
  findUserInDB,
  addMessageToUser,
  getFAQ,
  getTranslation,
  getDetailAnswer,
  getDirectionAnswer,
  getAvailabilityAnswer,
  getScheduleInfoAnswer,
  getSafetyInfoAnswer,
  getContactInfoAnswer,
  getPricingDetailAnswer,
} from '../db.mjs';

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

const userCache = new Map(); // Кэш для хранения данных пользователей

// Определение клавиатуры для выбора языка
const languageKeyboard = new Keyboard()
  .text('🇺🇦 Українська')
  .text('🇬🇧 English')
  .resized()
  .build();

// Функция создания главного меню
async function mainMenu(lang = 'uk') {
  const contact = await getTranslation('contact', lang);
  const faq = await getTranslation('faq', lang);
  const services = await getTranslation('services', lang);
  const directions = await getTranslation('directions', lang);
  const availability = await getTranslation('availability', lang);
  const scheduleInfo = await getTranslation('schedule_info', lang);
  const pricing = await getTranslation('pricing', lang);
  const safety = await getTranslation('safety', lang);

  return new InlineKeyboard()
    .text(contact, 'contact')
    .row()
    .text(faq, 'faq')
    .row()
    .text(services, 'services')
    .row()
    .text(directions, 'directions')
    .row()
    .text(availability, 'availability')
    .row()
    .text(scheduleInfo, 'schedule_info')
    .row()
    .text(pricing, 'pricing')
    .row()
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

// Обработка команды выбора режима дня
bot.callbackQuery('schedule_info', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const selectOption = await getTranslation('select_option', lang);

  const fullDay = await getTranslation('full_day', lang);
  const halfDay = await getTranslation('half_day', lang);
  const speechGroup = await getTranslation('speech_group', lang);
  const preSchool = await getTranslation('pre_school', lang);

  const keyboard = new InlineKeyboard()
    .text(fullDay, 'full_day')
    .row()
    .text(halfDay, 'half_day')
    .row()
    .text(speechGroup, 'speech_group')
    .row()
    .text(preSchool, 'pre_school');

  ctx.reply(selectOption, {
    reply_markup: keyboard,
  });
});

// Обработка подменю для каждого режима дня
bot.callbackQuery('full_day', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const fullDayData = await getScheduleInfoAnswer('full_day', lang);
  ctx.reply(fullDayData || 'Информация недоступна.');
});

bot.callbackQuery('half_day', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const halfDayData = await getScheduleInfoAnswer('half_day', lang);
  ctx.reply(halfDayData || 'Информация недоступна.');
});

bot.callbackQuery('speech_group', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const speechGroupData = await getScheduleInfoAnswer('speech_group', lang);
  ctx.reply(speechGroupData || 'Информация недоступна.');
});

bot.callbackQuery('pre_school', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const preSchoolData = await getScheduleInfoAnswer('pre_school', lang);
  ctx.reply(preSchoolData || 'Информация недоступна.');
});

// Добавляем обработчик для нового раздела "safety"
bot.callbackQuery('safety', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const selectOption = await getTranslation('select_option', lang);

  const bombShelter = await getTranslation('bomb_shelter', lang);
  const cameras = await getTranslation('cameras', lang);

  const keyboard = new InlineKeyboard()
    .text(bombShelter, 'bomb_shelter')
    .row()
    .text(cameras, 'cameras');

  ctx.reply(selectOption, {
    reply_markup: keyboard,
  });
});

// Обработка подменю для раздела "Безпека"
bot.callbackQuery('bomb_shelter', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const bombShelterData = await getSafetyInfoAnswer('bomb_shelter_info', lang);
  ctx.reply(bombShelterData || 'Информация недоступна.');
});

bot.callbackQuery('cameras', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const camerasData = await getSafetyInfoAnswer('cameras_info', lang);
  ctx.reply(camerasData || 'Информация недоступна.');
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

// Добавляем обработчик для нового раздела "pricing"
bot.callbackQuery('pricing', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const selectOption = await getTranslation('select_option', lang);

  const individualLessons = await getTranslation('individual_lessons', lang);
  const groupPricing = await getTranslation('group_pricing', lang);
  const workingHours = await getTranslation('working_hours', lang);
  const discounts = await getTranslation('discounts', lang);
  const pricing = await getTranslation('individual_lessons_pricing', lang);

  const keyboard = new InlineKeyboard()
    .text(individualLessons, 'individual_lessons')
    .row()
    .text(groupPricing, 'group_pricing')
    .row()
    .text(workingHours, 'working_hours')
    .row()
    .text(discounts, 'discounts')
    .row()
    .text(pricing, 'individual_lessons_pricing');

  ctx.reply(selectOption, {
    reply_markup: keyboard,
  });
});

// Обработка подменю для раздела "Індивідуальні заняття"
bot.callbackQuery('individual_lessons', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';

  const defectologist = await getTranslation('defectologist', lang);
  const neuropsychology = await getTranslation('neuropsychology', lang);
  const neurologopedy = await getTranslation('neurologopedy', lang);
  const sensoryIntegration = await getTranslation('sensory_integration', lang);
  const logorhythmics = await getTranslation('logorhythmics', lang);

  const keyboard = new InlineKeyboard()
    .text(defectologist, 'defectologist')
    .row()
    .text(neuropsychology, 'neuropsychology')
    .row()
    .text(neurologopedy, 'neurologopedy')
    .row()
    .text(sensoryIntegration, 'sensory_integration')
    .row()
    .text(logorhythmics, 'logorhythmics');

  ctx.reply(await getTranslation('select_option', lang), {
    reply_markup: keyboard,
  });
});

// Добавляем обработчики для каждого индивидуального занятия
bot.callbackQuery('defectologist', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('defectologist', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('neuropsychology', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('neuropsychology', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('neurologopedy', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('neurologopedy', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('sensory_integration', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('sensory_integration', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('logorhythmics', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('logorhythmics', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

// Добавляем обработчики для других подменю в разделе "pricing"
bot.callbackQuery('group_pricing', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('group_pricing_info', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('working_hours', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('working_hours_info', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

bot.callbackQuery('discounts', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const detailData = await getPricingDetailAnswer('discounts_info', lang);
  ctx.reply(detailData || 'Информация недоступна.');
});

// Добавляем обработчик для кнопки "Вартість"
bot.callbackQuery('individual_lessons_pricing', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const pricingInfo = await getPricingDetailAnswer(
    'individual_lessons_pricing',
    lang
  ); // Получение данных из коллекции PricingDetails
  ctx.reply(pricingInfo || 'Информация недоступна.');
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

// Добавляем обработчик для нового раздела "contact"
bot.callbackQuery('contact', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const selectOption = await getTranslation('select_option', lang);

  const socialNetworks = await getTranslation('social_networks', lang);
  const contactUs = await getTranslation('contact_us', lang);
  const address = await getTranslation('address', lang);

  const keyboard = new InlineKeyboard()
    .text(socialNetworks, 'social_networks')
    .row()
    .text(contactUs, 'contact_us')
    .row()
    .text(address, 'address');

  ctx.reply(selectOption, {
    reply_markup: keyboard,
  });
});

// Обработка подменю для раздела "Контакты"
bot.callbackQuery('social_networks', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const socialNetworksData = await getContactInfoAnswer(
    'social_networks',
    lang
  );
  ctx.reply(socialNetworksData || 'Информация недоступна.');
});

bot.callbackQuery('contact_us', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const contactUsData = await getContactInfoAnswer('contact_us', lang);
  ctx.reply(contactUsData || 'Информация недоступна.');
});

bot.callbackQuery('address', async (ctx) => {
  const lang = userCache.get(ctx.from.id)?.lang || 'uk';
  const addressData = await getContactInfoAnswer('address', lang);
  ctx.reply(addressData || 'Информация недоступна.');
});

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
