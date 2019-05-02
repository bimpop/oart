// AUTH ROUTES

const   express     = require('express'),
        router      = express.Router(),
        passport    = require('passport'),
        User        = require('../models/user');

// root route - homepage
router.get('/', function(req, res){
    res.render('home');
});

// auth signup new route
router.get('/signup', function(req, res){
    res.render('signup');
});

//auth signup create route
router.post('/signup', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            req.flash('error', err.message);
            res.redirect('/signup');
        } else {
            passport.authenticate('local')(req, res, function(){
                req.flash('success', 'Welcome to OART ' + user.username + '!');
                res.redirect('/artworks');
            });
        }
    });
});

// auth login new route
router.get('/login', function(req, res){
    res.render('login');
});

// auth login create route
router.post('/login', passport.authenticate('local', {
    successRedirect: '/artworks',
    failureRedirect: '/login'
}), function(req, res){});

// auth logout route
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Successfully logged out.');
    res.redirect('/artworks');
});

// page not found handler (ensure it's the last route!)
router.get('*', function(req, res){
    res.send('Sorry, the page you are requesting for could not be found.');
});

module.exports = router;