const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { create } = require('express-handlebars');  // Используем create для правильного импорта

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

// Маршруты
const indexRoute = require('./routes/index');
const bookRoute = require('./routes/book');
const menuRoute = require('./routes/menu');
const paRoute = require('./routes/pa');

// Подключаем маршруты
app.use('/', indexRoute);
app.use('/book', bookRoute);
app.use('/menu', menuRoute);
app.use('/PAua', paRoute);
app.use('/PAsu', paRoute);

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});