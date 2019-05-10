// ARTWORKS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork'),
        middleware  = require('../middleware');

// artwork routes are appended to /artworks

// artworks paginated index route - code courtesy Mikhail Evdokimov
router.get('/:page', function(req, res, next){
    var perPage = 12;
    var page = req.params.page || 1
    // get all artworks from DB first
    Artwork
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, artworks){
            Artwork.countDocuments().exec(function(err, count){
                if (err) {
                    req.flash('error', 'Sorry, unable to load artworks from gallery.');
                    res.redirect('/');
                } else {
                    res.render('artworks/index', {
                        artworks: artworks.reverse(),
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                } 
            });
        });
});

// artworks create route
router.post('/:page', middleware.isLoggedIn, function(req, res){
    // collect form data and add to DB
    Artwork.create(req.body.artwork, function(err, newArtwork){
        if(err){
            req.flash('error', err.message);
            // redirect to index route
            res.redirect('/artworks');
        }else {
            // add username and id to comment and save
            newArtwork.author.id = req.user._id;
            newArtwork.author.username = req.user.username;
            newArtwork.save();
            // redirect to index route
            res.redirect('/artworks'); 
        }
    });
});

// artworks show route
router.get('/:page/:id', function(req, res){
    // find the artwork with the provided id
    Artwork.findById(req.params.id, function(err){
        if(err){
            req.flash('error', 'Sorry, unable to find artwork.');
            res.redirect('back');
        }
    }).populate('comments').exec(function(err, foundArtwork){
        if (err) {
            req.flash('error', 'Sorry, unable to load comments.');
            // redirect to index route
            res.redirect('/artworks/' + req.params.page);
        } else {
            // render found artwork
            res.render('artworks/show', {artwork: foundArtwork, current: req.params.page});
        }
    });
});

// artwork update route
router.put('/:page/:id', middleware.isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndUpdate(req.params.id, req.body.artwork, function(err, updatedArtwork){
        if (err) {
            req.flash('error', err.message);
            // redirect to index route
            res.redirect('/artworks/1');
        } else {
            // redirect to show route
            res.redirect('/artworks/' + req.params.page + '/' + req.params.id);
        }
    });
});

// artwork destroy route
router.delete('/:page/:id', middleware.isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndDelete(req.params.id, function(err){
        if (err) {
            req.flash('error', err.message);
            res.redirect('/artworks/' + req.params.page);
        } else {
            // redirect to index route
            req.flash('success', 'Artwork deleted.');
            res.redirect('/artworks/' + req.params.page);
        }
    })
});

module.exports = router;