// COMMENTS ROUTES

var   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork'),
        Comment     = require('../models/comment'),
        middleware  = require('../middleware');

// comments routes are NOT appended to /artworks/:id/comments
// haven't figured out how to reference the req.params

//comments create route
router.post('/:page/:id/comments', function(req, res){
    // find artwork first
    Artwork.findById(req.params.id, function(err, foundArtwork){
        if (err) {
            req.flash('error', 'Sorry, unable to find artwork.');
            res.redirect('/artworks/' + req.params.page);
        } else {
            // add the new comment to the foundArtwork
            Comment.create(req.body.comment, function(err, newComment){
                if (err) {
                    req.flash('error', 'Sorry, unable to add comment.');
                    res.redirect('/artworks/' + req.params.page);
                } else {
                    // add comment to artwork association and save
                    foundArtwork.comments.push(newComment);
                    foundArtwork.save();
                    // redirect to artwork show route
                    res.redirect('/artworks/' + req.params.page + '/' + req.params.id);
                }
            });
        }
    });
});

// comment update route
router.put('/:page/:id/comments/:comment_id', function(req, res){
    // find the comment and update it
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
        if (err) {
            console.log(err);
            res.redirect('/artworks' + req.params.page + '/' + req.params.id);
        } else {
            // redirect to artwork show route
            res.redirect('/artworks/' + req.params.page + '/' + req.params.id);
        }
    });
});

// comment destroy route
router.delete('/:page/:id/comments/:comment_id', middleware.isLoggedIn, function(req, res){
    // find and delete the comment
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err) {
            req.flash('error', 'Unable to delete comment.');
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/artworks/' + req.params.page + '/' + req.params.id);
        }
    });
});

module.exports = router;