const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Настройка лимита запросов
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // Разрешить максимум 5 попыток
    standardHeaders: true, // Возвращать информацию в заголовках `RateLimit-*`
    legacyHeaders: false, // Отключить заголовки `X-RateLimit-*`
    handler: (req, res, next) => {
        const error = new Error('Too many login attempts from this IP, please try again after 15 minutes.');
        error.status = 429; // HTTP статус "Too Many Requests"
        next(error); // Передаём ошибку дальше
    }
});

// Рендер страницы авторизации
router.get('/', (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('PAua', {
        csrfToken: csrfToken,
        title: 'Personal Account - Log In',
        page: 'PAua',
        activePage: 'PAua'
    });
});

// Обработка авторизации
router.post('/', loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        // Проверяем, существует ли пользователь
        
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('PAua', {
                csrfToken: req.csrfToken(),
                title: 'Personal Account - Log In',
                page: 'PAua',
                activePage: 'PAua',
                errorMessage: 'Invalid email or password'
            });
        }

        req.session.userId = user._id;

        // Если всё корректно, перенаправляем на главную страницу
        res.redirect('/personal-account');
    } catch (error) {
        res.status(500).render('PAua', {
            csrfToken: req.csrfToken(),
            title: 'Personal Account - Log In',
            page: 'PAua',
            activePage: 'PAua',
            errorMessage: 'Server error. Please try again later.'
        });
    }
});

module.exports = router;