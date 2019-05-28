// ARTWORKS ROUTES

var   express     = require('express'),
        router      = express.Router(),
        Artwork     = require('../models/artwork'),
        middleware  = require('../middleware'),
        multer      = require('multer'),
        storage     = multer.diskStorage({
            filename: function(req, file, callback){
                callback(null, Date.now() + file.originalname);
            }
        }),
        imageFilter = function(req, file, cb){
            //accept image files only
            if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        upload      = multer({ storage: storage, fileFilter: imageFilter}),
        cloudinary  = require('cloudinary');

        cloudinary.config({
            cloud_name: 'o-art',
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

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
router.post('/:page', middleware.isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result){
        // add cloudinary url for the image to the artwork object under image property
        req.body.artwork.image = result.secure_url;
    });
    // collect form data and add to DB
    Artwork.create(req.body.artwork, function(err, newArtwork){
        if(err){
            req.flash('error', err.message);
            // redirect to index route
            res.redirect('/artworks/' + req.params.page);
        }else {
            // add username and id to comment and save
            newArtwork.author.id = req.user._id;
            newArtwork.author.username = req.user.username;
            newArtwork.save();
            // redirect to index route
            res.redirect('/artworks/1'); 
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
router.put('/:page/:id', middleware.isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result){
        // add cloudinary url for the image to the artwork object under image property
        req.body.artwork.image = result.secure_url;
    });
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