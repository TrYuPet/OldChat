var express = require('express');
var http = require('http');
var path = require('path');
var config = require('config');
var log = require('libs/log')(module);

var app = express();
// почти тоже самое, что и ejs только есть возможности layout, partial, blok
//engine. т.к файлы с таким расширением ejs, нужно обрабатывать как ejs-locals
app.engine('ejs', require ('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');

app.use(express.favicon()); // /favicon.ico

//смотрит запросы
if (app.get('env') == 'development') {
  app.use(express.logger('dev'));
} else {
  app.use(express.logger('default'));
}
//считывает формы методом post
app.use(express.bodyParser());  // доступны в req.body....

//парсит куки
app.use(express.cookieParser()); // req.cookies

//позволяет говорить, какие запросы и как будут обработаны
app.use(app.router);
app.get('/', function(req, res, next) {
  res.render("index", {
  });
});

//если предедущие middleware не обработаны, то упраление передается этому. и если он дирректории
//паблик, то ищет файл
app.use(express.static(path.join(__dirname, 'public')));


app.use(function(err, req, res, next) {
  // NODE_ENV = 'production'
  if (app.get('env') == 'development') {
    var errorHandler = express.errorHandler();
    errorHandler(err, req, res, next);
  } else {
    res.send(500);
  }
});
/*
 var routes = require('./routes');
 var user = require('./routes/user');
 // all environments
 app.get('/', routes.index);
 app.get('/users', user.list);
 */

http.createServer(app).listen(config.get('port'), function(){
  log.info('Express server listening on port ' + config.get('port'));
});