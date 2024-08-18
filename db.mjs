import { MongoClient } from "mongodb";

let dbInstance = null;

export async function connectToMongoDB() {
  if (!dbInstance) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      dbInstance = client.db("Telegram");
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      process.exit(1);
    }
  }
  return dbInstance;
}

export async function findUserInDB(userId, name, username) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("Users");
  const user = await usersCollection.findOne({ id: userId });

  if (!user) {
    // Добавляем нового пользователя
    await usersCollection.insertOne({
      id: userId,
      name: name,
      username: username,
      lang: "uk", // Установка языка по умолчанию
    });
  }

  return user;
}
// Функция для добавления сообщения к пользователю
export async function addMessageToUser(userId, message) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("Users");

  return await usersCollection.updateOne(
    { id: userId },
    {
      $push: { messages: message },
    }
  );
}

export async function getFAQ() {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("FAQ");
  const usersData = await usersCollection.find({}).toArray();
  console.log(usersData);
  return usersData;
}

export async function getTranslation(key, lang) {
  const db = await connectToMongoDB();
  const languagesCollection = db.collection("languages");

  const translation = await languagesCollection.findOne({ key: key });
  return translation ? translation[lang] : key;
}

