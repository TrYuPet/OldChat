/**
 * Created by tryupet on 04.04.15.
 */

exports.post = function(req, res, next) {
    var sid = req.session.id;

    var io = req.app.get('io');
    req.session.destroy(function(err) {
        io.sockets.emit("session:reload", sid);
        if (err) return next(err);

        res.redirect('/');
    });
};