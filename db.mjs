import { MongoClient } from 'mongodb';

let dbInstance = null;

// Функция для подключения к MongoDB
export async function connectToMongoDB() {
  if (!dbInstance) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI); // Создаем новый клиент MongoDB с использованием URI из переменных окружения
      await client.connect(); // Подключаемся к MongoDB
      dbInstance = client.db('Telegram'); // Выбираем базу данных 'Telegram'
      console.log('Подключено к MongoDB');
    } catch (error) {
      console.error('Не удалось подключиться к MongoDB:', error);
      process.exit(1); // Завершаем процесс, если не удалось подключиться к базе данных
    }
  }
  return dbInstance;
}

// Функция для поиска пользователя в базе данных по его ID
export async function findUserInDB(userId, name, username) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const usersCollection = db.collection('Users'); // Получаем коллекцию 'Users'
  const user = await usersCollection.findOne({ id: userId }); // Ищем пользователя по его ID

  if (!user) {
    // Если пользователь не найден, добавляем его в базу данных
    await usersCollection.insertOne({
      id: userId,
      name: name,
      username: username,
      lang: 'uk', // Установка языка по умолчанию
    });
  }

  return user;
}

// Функция для добавления сообщения пользователю
export async function addMessageToUser(userId, message) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const usersCollection = db.collection('Users'); // Получаем коллекцию 'Users'

  // Обновляем запись пользователя, добавляя новое сообщение
  return await usersCollection.updateOne(
    { id: userId },
    {
      $push: { messages: message }, // Добавляем новое сообщение в массив сообщений пользователя
    }
  );
}

// Функция для получения списка FAQ из базы данных
export async function getFAQ() {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const faqCollection = db.collection('FAQ'); // Получаем коллекцию 'FAQ'
  const faqData = await faqCollection.find({}).toArray(); // Получаем все записи FAQ в виде массива
  return faqData;
}

// Функция для получения перевода по ключу и языку
export async function getTranslation(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const languagesCollection = db.collection('languages'); // Получаем коллекцию 'languages'

  const translation = await languagesCollection.findOne({ key: key }); // Ищем перевод по ключу
  return translation ? translation[lang] : key; // Если перевод найден, возвращаем его, иначе возвращаем ключ
}

// Функция для получения ответа из коллекции Telegram.Details по ключу
export async function getDetailAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const detailsCollection = db.collection('Details'); // Получаем коллекцию 'Details'

  const detail = await detailsCollection.findOne({ key: key }); // Ищем ответ по ключу
  return detail ? detail.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения ответа из коллекции Telegram.Directions по ключу
export async function getDirectionAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const directionsCollection = db.collection('Directions'); // Получаем коллекцию 'Directions'

  const direction = await directionsCollection.findOne({ key: key }); // Ищем ответ по ключу
  return direction ? direction.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения ответа из коллекции Telegram.Availability по ключу
export async function getAvailabilityAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const availabilityCollection = db.collection('Availability'); // Получаем коллекцию 'Availability'

  const availability = await availabilityCollection.findOne({ key: key }); // Ищем ответ по ключу
  return availability ? availability.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения информации по расписанию дня из коллекции ScheduleInfo по ключу
export async function getScheduleInfoAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const scheduleInfoCollection = db.collection('ScheduleInfo'); // Получаем коллекцию 'ScheduleInfo'

  const scheduleInfo = await scheduleInfoCollection.findOne({ key: key }); // Ищем информацию по ключу
  return scheduleInfo ? scheduleInfo.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения информации из коллекции SafetyInfo по ключу
export async function getSafetyInfoAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const safetyInfoCollection = db.collection('SafetyInfo'); // Получаем коллекцию 'SafetyInfo'

  const safetyInfo = await safetyInfoCollection.findOne({ key: key }); // Ищем информацию по ключу
  return safetyInfo ? safetyInfo.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения информации из коллекции ContactDetails по ключу
export async function getContactInfoAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const contactDetailsCollection = db.collection('ContactDetails'); // Получаем коллекцию 'ContactDetails'

  const contactInfo = await contactDetailsCollection.findOne({ key: key }); // Ищем информацию по ключу
  return contactInfo ? contactInfo.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения информации из коллекции PricingDetails по ключу
export async function getPricingDetailAnswer(key, lang) {
  const db = await connectToMongoDB(); // Подключаемся к базе данных
  const pricingDetailsCollection = db.collection('PricingDetails'); // Получаем коллекцию 'PricingDetails'

  const pricingDetail = await pricingDetailsCollection.findOne({ key: key }); // Ищем информацию по ключу
  return pricingDetail ? pricingDetail.answer[lang] : null; // Возвращаем только основной текст ответа
}
