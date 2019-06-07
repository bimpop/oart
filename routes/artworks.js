// ARTWORKS ROUTES

var   express       = require('express'),
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
    cloudinary.v2.uploader.upload(req.file.path, function(err, result){
        if (err) {
            req.flash('error', 'Unable to upload image to cloudinary.');
            return res.redirect('back');
        }
        // add cloudinary url for the image to the artwork object under image property
        req.body.artwork.image = result.secure_url;
        // add image's public_id to artwork object
        req.body.artwork.imageId = result.public_id;
        //add author to artwork
        req.body.artwork.author = {
            id: req.user._id,
            username: req.user.username
        }
        // collect form data and add to DB
        Artwork.create(req.body.artwork, function(err, newArtwork){
            if(err){
                req.flash('error', err.message);
                // redirect to index route
                res.redirect('/artworks/' + req.params.page);
            }else {
                // redirect to index route
                res.redirect('/artworks/1'); 
            }
        });
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
    // find artwork with provided id
    Artwork.findById(req.params.id, async function(err, foundArtwork){
        if(err){
            req.flash('error', 'Unable to find the artwork you want to edit.');
            // redirect to index route
            return res.redirect('/artworks/' + req.params.page);
        }
        // if a new file has been uploaded
        if (req.file) {
            try {
                // delete previous upload from cloudinary
                await cloudinary.v2.uploader.destroy(foundArtwork.imageId);
                // upload new image to cloudinary
                var result = await cloudinary.v2.uploader.upload(req.file.path);
                // add cloudinary url for the image to the artwork object under image property
                foundArtwork.image = result.secure_url;
                foundArtwork.imageId = result.public_id;
            } catch (err) {
                req.flash('error', err.message);
                // redirect to index route
                return res.redirect('/artworks/' + req.params.page);
            }
        }
        // save other fields to artwork whether or not a new file is uploaded
        foundArtwork.title = req.body.artwork.title;
        foundArtwork.desc = req.body.artwork.desc;
        foundArtwork.save();
        req.flash('success', 'Successfully updated artwork.');
        // redirect to show route
        res.redirect('/artworks/' + req.params.page + '/' + req.params.id);
    });
});

// artwork destroy route
router.delete('/:page/:id', middleware.isLoggedIn, function(req, res){
    // find artwork with the provided id
    Artwork.findById(req.params.id, async function(err, foundArtwork){
        if (err) {
            req.flash('error', 'Unable to find the artwork you want to delete.');
            return res.redirect('/artworks/' + req.params.page);
        }
        try {
            // delete image from cloudinary
            await cloudinary.v2.uploader.destroy(foundArtwork.imageId);
            // delete the artwork from database
            foundArtwork.remove();
            // flash success and redirect to index route
            req.flash('success', 'Artwork deleted.');
            res.redirect('/artworks/' + req.params.page);
        } catch (err) {
            req.flash('error', 'Unable to delete artwork image.');
            return res.redirect('/artworks/' + req.params.page);
        }
    });
});

module.exports = router;