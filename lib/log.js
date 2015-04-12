/**
 * Created by tryupet on 04.04.15.
 */

//логгер винстон
var winston = require('winston');
//подключаем окружение напрямую из .NODE_ENV
var ENV = process.env.NODE_ENV; //app.get('env');

// can be much more flexible than that O_o
//логгер
function getLogger(module) {

    var path = module.filename.split('/').slice(-2).join('/');

    return new winston.Logger({
        transports: [
            new winston.transports.Console({
                colorize: true,
                level: (ENV == 'development') ? 'debug' : 'error',
                label: path //метка, указывает откуда берется файл. Например [d:\Ucheba\NodeJs\MyProject\Chat\app.js]
            })
        ]
    });
}

module.exports = getLogger;