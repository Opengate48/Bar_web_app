const mongoose = require('mongoose');

// Схема пользователя
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    reservedTables: [
        {
            table: { type: String },
            date: { type: String }
        }
    ]
});

// Модель пользователя
const User = mongoose.model('User', userSchema);

module.exports = User;