const mongoose = require("mongoose");

const StudentsSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    surname: String,
    date_of_birth: Date,
    phone: String,
    // question: String,
    gender: String,
    course: String,
    level: String,
    visit: Boolean,
    // Другие поля вашей модели, если есть
  },
  { timestamps: true }
);

const Students = mongoose.model("Students", StudentsSchema);

module.exports = Students;
