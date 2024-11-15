const mongoose = require('mongoose');
const { MONGO_URI, PORT } = require('../consts');

async function connectDB() {
  try {
    const db = await mongoose.connect(MONGO_URI);

    console.log(`Connected to DB: ${db.connection.name} on port ${PORT}`);
  } catch (error) {
    console.error('Could not connect to DB: ', error);
    process.exit(1); // Arrête le processus si la connexion échoue
  }
}

module.exports = connectDB;
