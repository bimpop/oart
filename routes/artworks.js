// ARTWORKS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork');

// artwork routes are appended to /artworks

// artworks index route
router.get('/', function(req, res){
    // get all artworks from DB first
    Artwork.find({}, function(err, artworks){
        if(err){
            console.log(err);
            // redirect to index route
            res.redirect('/artworks');
        }else {
            // render all found artworks
            res.render('artworks/index', {artworks: artworks});
        }
    });
});

// artworks new route
router.get('/new', isLoggedIn, function(req, res) {
    res.render('artworks/new');
});

// artworks create route
router.post('/', isLoggedIn, function(req, res){
    // collect form data
    var newArtwork = req.body.artwork;
    // add collected data to DB
    Artwork.create(newArtwork, function(err, newArtwork){
        if(err){
            console.log(err);
            // redirect to index route
            res.redirect('/artworks');
        }else {
            // redirect to index route
            res.redirect('/artworks'); 
        }
    });
});

// artworks show route
router.get('/:id', function(req, res){
    // find the artwork with the provided id
    Artwork.findById(req.params.id).populate('comments').exec(function(err, foundArtwork){
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
router.get('/:id/edit', isLoggedIn, function(req, res){
    // find artwork with the provided id
    Artwork.findById(req.params.id, function(err, editedArtwork){
        if (err) {
            console.log(err);
            // redirect to index route
            res.redirect('/artworks');
        } else {
            // render foundArtwork's edit form
            res.render('artworks/edit', {artwork: editedArtwork});
        }
    });
});

// artwork update route
router.put('/:id', isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndUpdate(req.params.id, req.body.artwork, function(err, updatedArtwork){
        if (err) {
            console.log(err);
            // redirect to index route
            res.redirect('/artworks');
        } else {
            // redirect to show route
            res.redirect('/artworks/' + req.params.id);
        }
    });
});

// artwork destroy route
router.delete('/:id', isLoggedIn, function(req, res){
    // find artwork with provided id
    Artwork.findByIdAndDelete(req.params.id, function(err){
        if (err) {
            console.log(err);
            res.redirect('/artworks');
        } else {
            // redirect to index route
            res.redirect('/artworks');
        }
    })
});

// middlewares
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;