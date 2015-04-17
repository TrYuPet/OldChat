/**
 * Created by tryupet on 17.04.15.
 */
var log = require('lib/log')(module);
var config = require('config');
var connect = require('connect'); // npm i connect
var async = require('async');
var cookie = require('cookie');   // npm i cookie
var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;

//делаем адаптацию вызова callback в loadSession к библиотеке async
function loadSession(sid, callback) {

    sessionStore.load(sid, function(err, session) {
        if (arguments.length == 0) {
            // no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });

}

function loadUser(session, callback) {

    //если юзера нету возвращаем null
    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    log.debug("retrieving user ", session.user);

    //если юзер есть -> user
    User.findById(session.user, function(err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        log.debug("user findbyId result: " + user);
        callback(null, user);
    });

}


module.exports = function(server) {

    //подключение socket.io к приложению
    var io = require('socket.io').listen(server);

    //подключаем доп. опции.
    // т.е. только сайт, который находится в домене localhost сможет подключаться
    // к нашему сервису
    io.set('origins', 'localhost:*');
    //делаем единный механизм логгирования. logger аналогичен winston
    io.set ('logger', log);

    io.set('authorization', function(handshake, callback) {
        async.waterfall([
            function(callback) {
                // сделать handshakeData.cookies - объектом с cookie
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                //получаем куку с ид. сессии
                var sidCookie = handshake.cookies[config.get('session:key')];
                //снимает подпись в куке с помощью метода connect
                var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret'));

                // получаем сессию из базы используя sessionStore
                loadSession(sid, callback);
            },

            function(session, callback) {

                if (!session) {
                    callback(new HttpError(401, "No session"));
                }

                handshake.session = session;

                //загружаем юзера
                loadUser(session, callback);
            },

            //ошибки авторизации
            function(user, callback) {
                //no user -> error
                if (!user) {
                    callback(new HttpError(403, "Anonymous session may not connect"));
                }

                handshake.user = user;
                callback(null);
            }

        ], function(err) {
            //если ошибки не было, то авторизация произведена успешно
            if (!err) {
                return callback(null, true);
            }

            if (err instanceof HttpError) {
                return callback(null, false);
            }

            callback(err);
        });

    });

    io.sockets.on('session:reload', function(sid) {

        //получаем все сокеты
        var clients = io.sockets.clients();

        clients.forEach(function(client) {
            //для каждого клиента проверяем, если его сессия не совпадает. то идем дальше
            if (client.handshake.session.id != sid)  return;

            //иначе используем метод loadSession
            loadSession(sid, function(err, session) {
                //если ошибка
                if (err) {
                    client.emit("error", "server error");
                    //отсоединяем клиента
                    client.disconnect();
                    return;
                }

                //если сессия не найдена
                if (!session) {
                    //отсоединяем
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                //если сессия есть, то записываем в handshake новую сессию
                client.handshake.session = session;
            });

        });

    });


    io.sockets.on('connection', function(socket) {

        var username = socket.handshake.user.get('username');

        socket.broadcast.emit('join', username);

        socket.on('message', function(text, cb) {
            socket.broadcast.emit('message', username, text);
            cb && cb();
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        });

    });

    return io;
};