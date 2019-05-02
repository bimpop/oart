// MIDDLEWARE

const   Artwork = require('../models/artwork'),
        Comment = require('../models/comment');

const middlewareObj = {};

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
    req.flash('error', 'You need to log in first.');
    res.redirect('/login');
}

middlewareObj.checkArtworkOwnership = function checkArtworkOwnership(req, res, next){
    // check if user is authenticated
    if(req.isAuthenticated()){
        // find artwork with the provided id
        Artwork.findById(req.params.id, function(err, editedArtwork){
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                // check if user is authorized
                if ((editedArtwork.author.id.equals(req.user._id)) || req.user.isAdmin ) {
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that.');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to log in first.');
        res.redirect('back');
    }
}

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        // find artwork with the provided id
        Comment.findById(req.params.comment_id, function(err, editedComment){
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                if(editedComment.author.id.equals(req.user._id) || req.user.isAdmin ){
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that.');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to log in first.');
        res.redirect('back');
    }
}

module.exports = middlewareObj;