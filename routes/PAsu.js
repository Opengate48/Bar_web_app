const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

// Рендер страницы регистрации
router.get('/', (req, res) => {
    const csrfToken = req.csrfToken();
    res.render('PAsu', {
        csrfToken: csrfToken,
        title: 'Personal Account - Sign Up',
        page: 'PAsu',
        activePage: 'PAua'
    });
});

// Обработка регистрации
router.post('/', async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Confirm Password:', confirmPassword);
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Проверка совпадения паролей
    if (trimmedPassword !== trimmedConfirmPassword) {
        return res.render('PAsu', {
            csrfToken: req.csrfToken(),
            title: 'Personal Account - Sign Up',
            page: 'PAsu',
            activePage: 'PAua',
            errorMessage: 'Passwords do not match'
        });
    }

    try {
        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

        // Создаем нового пользователя
        const newUser = new User({ email, password: hashedPassword });
        const savedUser = await newUser.save();
        req.session.userId = savedUser._id;
        // Перенаправляем на страницу авторизации
        res.redirect('/personal-account');
    } catch (error) {
        let errorMessage = 'Server error';
        if (error.code === 11000) {
            errorMessage = 'Email already registered';
        }

        res.render('PAsu', {
            csrfToken: req.csrfToken(),
            title: 'Personal Account - Sign Up',
            page: 'PAsu',
            activePage: 'PAua',
            errorMessage: errorMessage
        });
    }
});

module.exports = router;