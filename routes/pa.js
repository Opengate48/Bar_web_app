const express = require('express');
const router = express.Router();
const User = require('../models/User');
const moment = require('moment');

// Рендер страницы личного кабинета
router.get('/', async (req, res) => {
    const csrfToken = req.csrfToken();
    if (!req.session.userId) {
        return res.redirect('/authorization'); // Если пользователь не авторизован, перенаправляем на страницу авторизации
    }
    
    try {
        const user = await User.findById(req.session.userId);

        // Преобразуем данные в обычный объект, чтобы избежать проблем с доступом к прототипам
        const reservedTables = user.reservedTables.map(table => table.toObject());
        
        const reservedTablesWithImages = user.reservedTables.map(table => {
            let tableImage = '';
            switch (table.table) {
                case 'Table 1':
                    tableImage = 'book_table1.jpg';
                    break;
                case 'Table 2':
                    tableImage = 'book_table2.jpg';
                    break;
                case 'Table 3':
                    tableImage = 'book_table3.jpg';
                    break;
                case 'Billiard table':
                    tableImage = 'book_billiard.jpg';
                    break;
                default:
                    tableImage = 'default_table.jpg';
            }
            return { ...table.toObject(), image: tableImage };
        });

        res.render('PA', {
            csrfToken: csrfToken,
            title: 'Personal Account',
            page: 'PA',
            activePage: 'PAua',
            userEmail: user.email,
            reservedTables: reservedTables, // Передаем преобразованные данные
            reservedTables: reservedTablesWithImages
        });
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Логика выхода
router.post('/', (req, res) => {
    req.session.destroy();
    res.redirect('/authorization');
});

module.exports = router;
