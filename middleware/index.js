// MIDDLEWARE

const   Artwork = require('../models/artwork'),
        Comment = require('../models/comment');

const middlewareObj = {};

middlewareObj.currentUser = function currentUser(req, res, next){
    res.locals.currentUser = req.user;
    next();
}

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

middlewareObj.checkArtworkOwnership = function checkArtworkOwnership(req, res, next){
    if(req.isAuthenticated()){
        // find artwork with the provided id
        Artwork.findById(req.params.id, function(err, editedArtwork){
            if (err) {
                res.redirect('back');
            } else {
                if(editedArtwork.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect('back');
    }
}

middlewareObj.checkCommentOwnership = function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        // find artwork with the provided id
        Comment.findById(req.params.comment_id, function(err, editedComment){
            if (err) {
                res.redirect('back');
            } else {
                if(editedComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect('back');
    }
}

module.exports = middlewareObj;