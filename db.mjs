import { MongoClient } from "mongodb";

let dbInstance = null;

export async function connectToMongoDB() {
  if (!dbInstance) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      dbInstance = client.db();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      process.exit(1);
    }
  }
  return dbInstance;
}

export async function fetchUser(userId) {
  const db = await connectToMongoDB();
  const usersCollection = db.collection("Users");
  return await usersCollection.findOneAndUpdate(
    { id: userId },
    { $set: { id: userId } },
    { upsert: true }
  );
}
