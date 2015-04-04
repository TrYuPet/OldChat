/**
 * Created by tryupet on 04.04.15.
 */
exports.post = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};