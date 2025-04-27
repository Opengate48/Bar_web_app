const express = require('express');
const router = express.Router();
const User = require('../models/User');
const moment = require('moment');
const csrf = require('csurf');
const csrfProtection = csrf();

router.use(csrfProtection);

function isAuthenticated(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/authorization'); // Если пользователь не авторизован
    }
    next(); // Если авторизован, продолжаем выполнение
}

// Доступные столы
router.get('/', isAuthenticated, (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('book', {
        csrfToken: csrfToken,
        title: 'Book a Table',
        page: 'book',
        activePage: 'book',
        tables: [
            { table: 'Table 1', tablepic: 'book_table1.jpg', price: 10 },
            { table: 'Table 2', tablepic: 'book_table2.jpg', price: 10 },
            { table: 'Table 3', tablepic: 'book_table3.jpg', price: 10 },
            { table: 'Billiard table', tablepic: 'book_billiard.jpg', price: 15 }
        ]
    });
});

router.post('/', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).send('Please log in to reserve a table');
    }

    const { table, hour } = req.body;

    try {
        const currentDateTime = moment(); // Текущее время
       
        const reservedDateTime = moment(hour, "HH:mm"); // Время из формы (HH:mm формат)
      
        const currentHour = currentDateTime.hour(); // Час текущего времени
        const reservedHour = parseInt(hour.split(":")[0], 10); // Час из выбранного времени


        // Проверяем, если пользователь пытается забронировать время, которое уже прошло
        
        if (18 <= reservedHour && reservedHour <= 23 && 18 <= currentHour && currentHour <= 23 ){
            if (reservedDateTime.isBefore(currentDateTime)) {
                return res.status(400).send('Cannot reserve a table for a past time.');
            }
        }
        if (0 <= reservedHour && reservedHour <= 2 && 0 <= currentHour && currentHour <= 2 ){
            if (reservedDateTime.isBefore(currentDateTime)) {
                return res.status(400).send('Cannot reserve a table for a past time.');
            }
        }
        if (18 <= reservedHour && reservedHour <= 23 && 0 <= currentHour && currentHour <= 2 ){
            return res.status(400).send('Cannot reserve a table for a past time.');
        }
        // Проверяем наличие конфликта бронирования
        const conflictingReservation = await User.findOne({
            'reservedTables.table': table,
            'reservedTables.date': hour // Сравнение ISO-формата
        });

        if (conflictingReservation) {
            return res.status(400).send('This table is already reserved for the selected time.');
        }
        
        // Сохраняем бронирование
        const user = await User.findById(req.session.userId);
        user.reservedTables.push({ table, date: hour });
        await user.save();

        res.status(200).send('Reservation successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
