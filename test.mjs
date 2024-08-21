// import { connectToMongoDB } from "./db.mjs";
// const test = await connectToMongoDB();

// await test.collection("Users").insertOne({ id: 1 });

// console.log(await test.collection("Users").insertOne({ id: 1 }));

// import {
//   findUserInDB,
//   addUserToDB,
//   addMessageToUser,
//   getFAQ,
//   getTranslation,
// } from './src/services/dbService.mjs';

// async function runTests() {
//   // Здесь можно реализовать тесты для локальных данных

//   const userId = 123456;

//   // Пример теста поиска пользователя
//   const user = await findUserInDB(userId);
//   console.log(user ? `User found: ${JSON.stringify(user)}` : 'User not found');

//   // Другие тесты...
// }

// runTests().catch(console.error);
