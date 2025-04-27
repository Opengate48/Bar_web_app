const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('menu', {
        title: 'Menu',
        page: 'menu',
        activePage: 'menu'
    });
});

module.exports = router;
