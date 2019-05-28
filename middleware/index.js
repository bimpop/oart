// MIDDLEWARE

var   Artwork = require('../models/artwork'),
        Comment = require('../models/comment');

var middlewareObj = {};

middlewareObj.currentUser = function currentUser(req, res, next){
    res.locals.currentUser  = req.user;
    res.locals.error        = req.flash('error');
    res.locals.success      = req.flash('success');
    next();
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You don\'t have permission to do that.');
    res.redirect('back');
}

module.exports = middlewareObj;