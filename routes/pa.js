const express = require('express');
const router = express.Router();

// Рендер страницы авторизации
router.get('/', (req, res) => {
    res.render('PAua', {
        title: 'Personal Account - Log In',
        page: 'PAua'
    });
});

// Обработка POST-запроса при авторизации
router.post('/', (req, res) => {
    // Логика авторизации: проверка email и пароля
    const { email, password } = req.body;
    if (email === 'user@example.com' && password === 'password') {
        // Если авторизация успешна, перенаправляем на страницу с личным кабинетом
        res.redirect('/PAua');
    } else {
        res.send('Invalid email or password');
    }
});

// Рендер страницы регистрации
router.get('/register', (req, res) => {
    res.render('PAsu', {
        title: 'Personal Account - Sign Up',
        page: 'PAsu',
        activePage: 'PAua'
    });
});

module.exports = router;