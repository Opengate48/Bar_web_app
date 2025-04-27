const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { create } = require('express-handlebars');  // Используем create для правильного импорта
const mongoose = require('mongoose');
const session = require('express-session');
const csrf = require('csurf');
const cron = require('node-cron');
const moment = require('moment'); // Для работы с временем
const User = require('./models/User');


// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/comrades_bar');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const app = express();
const port = 3000;

// Создаем экземпляр Handlebars с хелперами
const hbs = create({
    helpers: {
        eq: function(a, b) {
            return a === b;
        }
    },
    extname: '.hbs',  // Указываем расширение .handlebars
    defaultLayout: 'main'
});

// Настройка Handlebars
app.engine('hbs', hbs.engine);  // Используем экземпляр hbs для настройки движка
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));  // Убедитесь, что путь к папке с шаблонами правильный

// Статические файлы (CSS, изображения и другие файлы)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для обработки POST-запросов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('45b488b152c268b205c05f63e1c85e54f3c34fecc4f8b634ee4fed18ac06bca3573dd33faa1721f96665eec6ee8c8ed7f6a779e3503e0fad44b403fad7ff90fa'));
// Подключаем сессии
app.use(session({
    secret: '45b488b152c268b205c05f63e1c85e54f3c34fecc4f8b634ee4fed18ac06bca3573dd33faa1721f96665eec6ee8c8ed7f6a779e3503e0fad44b403fad7ff90fa', // Убедитесь, что секретный ключ уникален и безопасен
    resave: false, // Не сохранять сессию, если она не была изменена
    saveUninitialized: false, // Не сохранять сессию, если она не была инициализирована
    cookie: {
        httpOnly: true,  // Сделать cookie недоступным для JavaScript
        secure: process.env.NODE_ENV === 'production',  // Использовать secure, если в продакшн
        sameSite: 'Strict',  // Запрещать отправку cookies с других сайтов
        maxAge: 60000  // Длительность сессии - 1 минута (в миллисекундах)
    }
}));

// Подключение CSRF-защиты
app.use(csrf({ cookie: false }));

// Маршруты
const indexRoute = require('./routes/index');
const bookRoute = require('./routes/book');
const menuRoute = require('./routes/menu');
const autRoute = require('./routes/PAua');
const regRoute = require('./routes/PAsu');
const paRoute = require('./routes/pa');



// Подключаем маршруты
app.use('/', indexRoute);
app.use('/book', bookRoute);
app.use('/menu', menuRoute);
app.use('/authorization', autRoute);
app.use((err, req, res, next) => {
    if (err.status === 429) {
        return res.render('PAua', {
            csrfToken: req.csrfToken(),
            title: 'Personal Account - Log In',
            page: 'PAua',
            activePage: 'PAua',
            errorMessage: err.message // Передаём сообщение об ошибке
        });
    }

    // Для других ошибок
    res.status(err.status || 500).render('error', {
        message: err.message || 'Internal Server Error'
    });
});
app.use('/registration', regRoute);
app.use('/personal-account', paRoute);

// Задача cron, которая запускается каждый час с 17:00 до 3:00
cron.schedule('0 17-23,0-3 * * *', async () => {
    console.log("Начинается проверка истекших бронирований...");
    const currentHour = moment().hour(); // Текущий час
    const users = await User.find(); // Получаем всех пользователей из базы

    for (const user of users) {
        
        let updatedTables = user.reservedTables.filter(reservation => {
            const reservedHour = parseInt(reservation.date.split(':')[0], 10);
            return (((18 <= reservedHour && reservedHour <= 23 && 18 <= currentHour && currentHour <= 23 && reservedHour > currentHour) || (0 <= reservedHour && reservedHour <= 3 && 0 <= currentHour && currentHour <= 3 && reservedHour > currentHour)) && !(18 <= reservedHour && reservedHour <= 23 && 0 <= currentHour && currentHour <= 3)); // Сохраняем только актуальные бронирования
        });

        if (updatedTables.length !== user.reservedTables.length) {
            user.reservedTables = updatedTables;
            await user.save(); // Сохраняем обновленного пользователя
            console.log(`Обновлен пользователь: ${user.email}`);
        }
    }
    console.log("Проверка истекших бронирований завершена.");
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});