// CONTACTS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Contact     = require('../models/contact'),
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

// contacts routes are appended to /artworks

// contact index route
router.get('/:page', middleware.isLoggedIn, function(req, res){
    var perPage = 10;
    var page = req.params.page || 1
    // get all contacts from DB first
    Contact
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, contacts){
            Contact.countDocuments().exec(function(err, count){
                if (err) {
                    req.flash('error', 'Sorry, unable to load contacts.');
                    res.redirect('back');
                } else {
                    res.render('contacts/index', {
                        contacts: contacts.reverse(),
                        current: page,
                        pages: Math.ceil(count / perPage)
                    });
                } 
            });
        });
});

// contact create route
router.post('/:page', middleware.isLoggedIn, upload.single('image'), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result){
        // add cloudinary url for the image to the artwork object under image property
        req.body.contact.image = result.secure_url;
    });
    Contact.create(req.body.contact, function(err, newContact){
        if (err) {
            console.log(err);
            req.flash('error', 'Unable to send message.');
            res.redirect('back');
        } else {
            req.flash('success', 'Message sent.');
            res.redirect('back');
        }
    });
});

// contact update route
router.put('/:page/:contact_id', function(req, res){
    Contact.findById(req.params.contact_id, function(err, foundContact){
        if (err) {
            console.log(err);
            req.flash('error', 'Unable to find the contact.');
            res.redirect('back');
        } else {
            if (foundContact.status === 'checked') {
                foundContact.status = 'unchecked'
                foundContact.save();
                req.flash('success', 'Contact unchecked.');
            } else {
                foundContact.status = 'checked'
                foundContact.save();
                req.flash('success', 'Contact checked.');
            }
            res.redirect('/contacts/' + req.params.page);
        }
    });
});

// contact delete route
router.delete('/:page/:contact_id', function(req, res){
    Contact.findByIdAndDelete(req.params.contact_id, function(err){
        if (err) {
            console.log(err);
            req.flash('error', 'Unable to find or delete the contact.');
            res.redirect('back');
        } else {
            res.redirect('/contacts/' + req.params.page);
        }
    })
});

module.exports = router;