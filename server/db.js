const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Cambia si tienes contraseña en tu XAMPP
    database: 'nova_salud'
});

module.exports = db;