// ARTWORKS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork'),
        middleware  = require('../middleware');

// artwork routes are appended to /artworks

// artworks index route
router.get('/', function(req, res){
    // get all artworks from DB first
    Artwork.find({}, function(err, artworks){
        if(err){
            req.flash('error', err.message);
            // redirect to index route
            res.redirect('/artworks');
        }else {
            // render all found artworks
            res.render('artworks/index', {artworks: artworks.reverse()});
        }
    });
});

// artworks new route
router.get('/new', middleware.isLoggedIn, function(req, res) {
    res.render('artworks/new');
});

// artworks create route
router.post('/', middleware.isLoggedIn, function(req, res){
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
router.get('/:id', function(req, res){
    // find the artwork with the provided id
    Artwork.findById(req.params.id, function(err){
        if(err){
            console.log(err);
        }
    }).populate('comments').exec(function(err, foundArtwork){
        if (err) {
            console.log(err);
            // redirect to index route
            res.redirect('/artworks');
        } else {
            // render found artwork
            res.render('artworks/show', {artwork: foundArtwork});
        }
    });
});

// artwork edit route
router.get('/:id/edit', middleware.isLoggedIn, function(req, res){
    Artwork.findById(req.params.id, function(err, editedArtwork){
        // render foundArtwork's edit form
        res.render('artworks/edit', {artwork: editedArtwork});
    });
});

// artwork update route
router.put('/:id', middleware.isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndUpdate(req.params.id, req.body.artwork, function(err, updatedArtwork){
        if (err) {
            req.flash('error', err.message);
            // redirect to index route
            res.redirect('/artworks');
        } else {
            // redirect to show route
            res.redirect('/artworks/' + req.params.id);
        }
    });
});

// artwork destroy route
router.delete('/:id', middleware.isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndDelete(req.params.id, function(err){
        if (err) {
            req.flash('error', err.message);
            res.redirect('/artworks');
        } else {
            // redirect to index route
            req.flash('success', 'Artwork deleted.');
            res.redirect('/artworks');
        }
    })
});

module.exports = router;