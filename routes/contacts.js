// CONTACTS ROUTES

const   express     = require('express'),
        router      = express.Router(),
        Contact     = require('../models/contact'),
        middleware  = require('../middleware');

// contacts routes are appended to /artworks

// contact index route
router.get('/', middleware.isLoggedIn, function(req, res){
    Contact.find({}, function(err, contacts){
        if (err) {
            console.log(err);
            req.flash('error', err.message);
            res.redirect('back');
        } else {
            res.render('contacts/index', {contacts: contacts.reverse()});
        }
    });
});

// contact create route
router.post('/', middleware.isLoggedIn, function(req, res){
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
router.put('/:contact_id', function(req, res){
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
            res.redirect('/contacts');
        }
    });
});

// contact delete route
router.delete('/:contact_id', function(req, res){
    Contact.findByIdAndDelete(req.params.contact_id, function(err){
        if (err) {
            console.log(err);
            req.flash('error', 'Unable to find or delete the contact.');
            res.redirect('back');
        } else {
            res.redirect('/contacts');
        }
    })
});

module.exports = router;