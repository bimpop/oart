// COMMENTS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork'),
        Comment     = require('../models/comment'),
        middleware  = require('../middleware');

// comments routes are NOT appended to /artworks/:id/comments
// haven't figured out how to reference the req.params

// comments new route
router.get('/artworks/:id/comments/new', middleware.isLoggedIn, function(req, res){
    // find artwork first
    Artwork.findById(req.params.id, function(err, foundArtwork){
        if (err) {
            console.log(err);
            res.redirect('/artworks');
        } else {
            // render add new comment form
            res.render('comments/new', {artwork: foundArtwork});
        }
    });
});

//comments create route
router.post('/artworks/:id/comments', middleware.isLoggedIn, function(req, res){
    // find artwork first
    Artwork.findById(req.params.id, function(err, foundArtwork){
        if (err) {
            console.log(err);
            res.redirect('/artworks');
        } else {
            // add the new comment to the foundArtwork
            Comment.create(req.body.comment, function(err, newComment){
                if (err) {
                    console.log(err);
                    res.redirect('/artworks');
                } else {
                    // add username and id to comment and save
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    // add comment to artwork association and save
                    foundArtwork.comments.push(newComment);
                    foundArtwork.save();
                    // redirect to artwork show route
                    res.redirect('/artworks/' + req.params.id);
                }
            });
        }
    });
});

// comment edit route
router.get('/artworks/:id/comments/:comment_id/edit', middleware.checkCommentOwnership, function(req, res){
    // find comment
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err) {
            console.log(err);
            res.redirect('/artworks' + req.params.id);
        } else {
            // render edit form
            res.render('comments/edit', {artwork_id: req.params.id, comment: foundComment});
        }
    });
});

// comment update route
router.put('/artworks/:id/comments/:comment_id', middleware.checkCommentOwnership, function(req, res){
    // find the comment and update it
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
        if (err) {
            console.log(err);
            res.redirect('/artworks' + req.params.id);
        } else {
            // redirect to artwork show route
            res.redirect('/artworks/' + req.params.id);
        }
    });
});

// comment destroy route
router.delete('/artworks/:id/comments/:comment_id', middleware.checkCommentOwnership, function(req, res){
    // find and delete the comment
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/artworks/' + req.params.id);
        }
    });
});

module.exports = router;