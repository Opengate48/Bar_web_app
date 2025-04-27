const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('book', {
        title: 'Book a Table',
        page: 'book',
        activePage: 'book'
    });
});

module.exports = router;
