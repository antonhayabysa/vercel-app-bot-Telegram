import { MongoClient } from "mongodb";

export async function connectToMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB);
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(); // Возвращает экземпляр базы данных
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}
