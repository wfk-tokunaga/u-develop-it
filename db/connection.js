const mysql = require('mysql2');

// Connect to mysql database
const db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'dAisy>peach!1!',
        database: 'election'
    },
    console.log('Connected to the election database.')
);

module.exports = db;