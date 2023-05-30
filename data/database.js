const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database; // 외부 파일에서 사용할 수 있도록 변수 생성

async function connect() {
  const client = await MongoClient.connect("mongodb://localhost:27017"); // 서버 전체에 관한 연결 설정
  database = client.db("blog");
}

function getDb() {
  if (!database) {
    throw { message: "Database connection not established!" };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
