/**
 * Created by tryupet on 17.04.15.
 */
var log = require('lib/log')(module);

module.exports = function(server) {

    //подключение socket.io к приложению
    var io = require('socket.io').listen(server);

    //подключаем доп. опции.
    // т.е. только сайт, который находится в домене localhost сможет подключаться
    // к нашему сервису
    io.set('origins', 'localhost:*');
    //делаем единный механизм логгирования. logger аналогичен winston
    io.set ('logger', log);

    io.sockets.on('connection', function (socket) {
    //возвращаем сообщение всем поситителям.
        //второй аргумент функции: когда on('message') получает что-то с клиента, то оно когда обработает
        // должно вызвать callback.  именно в это cb она пеедаст данные, которые появятся в клиенте (chat.ejs -> ul)
        socket.on('message', function (text, cb) {
            socket.broadcast.emit('message', text);
            cb && cb();
        });
    });
};