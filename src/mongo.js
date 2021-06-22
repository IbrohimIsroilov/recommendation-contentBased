const MongoClient = require("mongodb").MongoClient;

var db;

const connectDb = (callback) => {
  if (db) return callback();
  MongoClient.connect(
    "mongodb+srv://generalUser:g5jE6R8JfkcAs4er5TC@cluster0.yxdzl.mongodb.net/contentBasedFiltering?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, database) => {
      if (err) return console.log(err);
      db = database.db();
      console.log("Database Connected");
      callback();
    }
  );
};

const getDb = (collectionToGet) => {
  return new Promise(function (resolve, reject) {
    db.collection(collectionToGet)
      .find()
      .toArray(function (err, docs) {
        if (err) {
          return reject(err);
        }
        // Resolve the promise with data

        return resolve(docs);
      });
  });
};

module.exports = {
  connectDb,
  getDb,
};
