const mongoose = require("mongoose");

const dbConnection = async () => {
  await mongoose.connect(process.env.DATABASE_URL).then((conn) => {
    console.log(`Database connected ✅: ${conn.connection.host}`);
  });
};
module.exports = dbConnection;
