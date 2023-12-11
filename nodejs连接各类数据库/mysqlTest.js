'use strict'
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '192.168.15.133',
    port: 3306,
    user: 'root',
    password: 'TL#dsj!nwcsj1513323622',
    database: 'test'
});
connection.connect();

connection.query('SELECT * from test', function (error, results, fields) {
    if (error) throw error;
    console.log(results);
});

connection.end();
