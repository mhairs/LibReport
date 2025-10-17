require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  host: process.env.HOST,
  env: process.env.NODE_ENV
};

