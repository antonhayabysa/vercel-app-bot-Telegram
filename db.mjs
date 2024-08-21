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
  const db = await connectToMongoDB();
  const usersCollection = db.collection('Users');
  const user = await usersCollection.findOne({ id: userId });

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
  const db = await connectToMongoDB();
  const usersCollection = db.collection('Users');

  return await usersCollection.updateOne(
    { id: userId },
    {
      $push: { messages: message }, // Добавляем новое сообщение в массив сообщений пользователя
    }
  );
}

// Функция для получения списка FAQ из базы данных
export async function getFAQ() {
  const db = await connectToMongoDB();
  const faqCollection = db.collection('FAQ');
  const faqData = await faqCollection.find({}).toArray(); // Получаем все записи FAQ
  return faqData;
}

// Функция для получения перевода по ключу и языку
export async function getTranslation(key, lang) {
  const db = await connectToMongoDB();
  const languagesCollection = db.collection('languages');

  const translation = await languagesCollection.findOne({ key: key });
  return translation ? translation[lang] : key; // Если перевод найден, возвращаем его, иначе возвращаем ключ
}

// Функция для получения ответа из коллекции Telegram.Details по ключу
export async function getDetailAnswer(key, lang) {
  const db = await connectToMongoDB();
  const detailsCollection = db.collection('Details');

  const detail = await detailsCollection.findOne({ key: key });
  return detail ? detail.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения ответа из коллекции Telegram.Directions по ключу
export async function getDirectionAnswer(key, lang) {
  const db = await connectToMongoDB();
  const directionsCollection = db.collection('Directions');

  const direction = await directionsCollection.findOne({ key: key });
  return direction ? direction.answer[lang] : null; // Возвращаем только основной текст ответа
}

// Функция для получения ответа из коллекции Telegram.Availability по ключу
export async function getAvailabilityAnswer(key, lang) {
  const db = await connectToMongoDB();
  const availabilityCollection = db.collection('Availability');

  const availability = await availabilityCollection.findOne({ key: key });
  return availability ? availability.answer[lang] : null; // Возвращаем только основной текст ответа
}
