const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {
        title: 'Comrades Bar',
        page: 'index',
        activePage: 'home'
    });
});

module.exports = router;