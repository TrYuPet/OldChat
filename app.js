//подключаем наш express фреймвок
var express = require('express');
//модули http
var http = require('http');
var path = require('path');

var config = require('config');
var log = require('lib/log')(module);
var mongoose = require('lib/mongoose');
var HttpError = require('error').HttpError;

//Функция обработки запросов
var app = express();

// почти тоже самое, что и ejs только есть возможности layout, partial, blok
//engine. т.к файлы с таким расширением ejs, нужно обрабатывать как ejs-locals
app.engine('ejs', require ('ejs-locals'));

//указывает местоположение шаблонов
app.set('views', __dirname + '/template');

//дижок шаблонов
app.set('view engine', 'ejs');

//читает иконку или иначе передает управление дальше
app.use(express.favicon()); // /favicon.ico

//смотрит какой пришел запрос
if (app.get('env') == 'development') {
  app.use(express.logger('dev'));
} else {
  app.use(express.logger('default'));
}
//считывает формы методом post
app.use(express.bodyParser());  // доступны в req.body....

//парсит куки
app.use(express.cookieParser()); // req.cookies

var MongoStore = require('connect-mongo')(express);

app.use(express.session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

//обрабатывает необходимые запросы нужным способом
app.use(app.router);
require('routes')(app);

app.use(express.static(path.join(__dirname, 'public')));

//обработчик ошибок
app.use(function(err, req, res, next) {
    if (typeof err == 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            express.errorHandler()(err, req, res, next);
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});

//создаем http сервер
var server = http.createServer(app);
//подключаем порт
server.listen(config.get('port'), function(){
    log.info('Express server listening on port ' + config.get('port'));
});

//подключение socket.io к приложению
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
//возвращаем сообщение всем поситителям.
    //второй аргумент функции: когда on('message') получает что-то с клиента, то оно когда обработает
    // должно вызвать callback.  именно в это cb она пеедаст данные, которые появятся в клиенте (chat.ejs -> ul)
    socket.on('message', function (text, cb) {
        socket.broadcast.emit('message', text);
        cb("123");
    });
});