const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

//My models MongoDB
const User = require("./models/user");
const Students = require("./models/students"); // Путь к вашему файлу с моделью User
const URL = require("./my_modules/connect");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      `https://cambridge-admin.netlify.app`,
      `https://hlc-center.netlify.app`,
    ],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Если вы используете аутентификацию
  })
);

mongoose
  .connect(process.env.MONGO_URI || URL)
  .then((res) => console.log("Connected to MongoDB"))
  .catch((error) => console.log(error));

//INFO: Verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Необходим токен для доступа." });
  }

  jwt.verify(token, "hisor-cambridge-center", (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Недействительный токен.", err: err.message });
    }

    // Если токен верифицирован успешно, можно сохранить информацию о пользователе
    req.user = decoded;
    next(); // Передаем управление следующему middleware
  });
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ Login: username, Password: password });
  if (user === null) {
    res.status(401).json({ message: "Неверное имя пользователя или пароль." });
  } else {
    const token = jwt.sign({ username }, "hisor-cambridge-center", {
      expiresIn: "1h",
    });
    return res.json({ token });
  }
});

app.get("/logout", (req, res) => {
  res.json({ message: "Вы успешно вышли" });
});

app.get("/students", verifyToken, async (req, res) => {
  try {
    console.log("Good");
    // Используем метод find() для получения всех пользователей из коллекции "users"
    const users = await Students.find();
    // Отправляем полученных пользователей в ответе как JSON
    res.json(users);
  } catch (error) {
    console.error("Bad");
    res.status(500).json({ error: "Произошла ошибка при получении данных" });
  }
});

app.put("/visit_student/:id", verifyToken, (req, res) => {
  const userId = req.params.id;
  Students.findByIdAndUpdate(userId, { visit: true }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      return res.status(200).json({
        message: "Пользователь успешно обновлен",
        user: updatedUser,
      });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Произошла ошибка при обновлении пользователя" });
    });
});

app.delete("/student_del/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Students.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Документ не найден" });
    }
    return res.status(200).json({ message: "Документ успешно удален" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Произошла ошибка при удалении документа" });
  }
});

app.post("/registration", (req, res) => {
  const registrationData = req.body;
  console.log(registrationData);
  const registration = new Students({
    name: registrationData.name,
    surname: registrationData.surname,
    date_of_birth: registrationData.date_of_birth,
    phone: registrationData.phone,
    gender: registrationData.gender,
    level: registrationData.level,
    course: registrationData.course,
    question: registrationData.question,
    visit: registrationData.visit,
  });
  registration
    .save()
    .then(() => {
      const htmlFilePath = path.join(__dirname, "public", "index.html");
      res.sendFile(htmlFilePath);
    })
    .catch((error) => {
      console.error(error);
      res
        .status(500)
        .json({ message: "Произошла ошибка при добавлении регистрации" });
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
