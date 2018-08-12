var mysql = require('mysql');

var config = {
  host: process.env.MY_VULTR_DB_HOST,
  user: process.env.MY_VULTR_DB_USER,
  password: process.env.MY_VULTR_DB_PWD,
  database: 'sororoc',
  connectionLimit: 30
};

console.log(config)

var pool = mysql.createPool(config);

module.exports = pool;