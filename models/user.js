const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Login: String,
  Password: String,
  // Другие поля вашей модели, если есть
});


const User = mongoose.model("users", userSchema);

module.exports = User;
