/**
 * Created by tryupet on 04.04.15.
 */
//подключаем nconf
var nconf = require('nconf');
var path = require('path');

//указываем откуда будем читать конфиг
nconf.argv()
    .env()
    .file({ file: path.join(__dirname, 'config.json') });

module.exports = nconf;
