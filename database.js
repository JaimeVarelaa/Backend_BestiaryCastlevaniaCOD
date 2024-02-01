const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({

    host: 'localhost',
    user: 'root',
    password: '',
    database: 'castlevaniaCOD',
    multipleStatements: true,

});

mysqlConnection.connect(function (err) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log('Database connection established');
    }
});

module.exports = mysqlConnection;