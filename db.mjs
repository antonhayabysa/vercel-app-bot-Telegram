const { MongoClient } = require("mongodb");

export default await MongoClient.connect(process.env.MONGODB);
