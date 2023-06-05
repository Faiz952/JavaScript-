'use strict'
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '121.37.132.231',
    port: '4321',
    user: 'root',
    password: 'kpPassword@1',
    database: 'jxsyrk',
    timezone: "08:00",
    dateStrings: true,
    multipleStatements: true
});

connection.connect();

connection.query('SELECT max(name) as x from tlv_bzdz', function (error, results, fields) {
    if (error) throw error;
    console.log(results);
});

connection.end();
