// AUTH ROUTES

const   express     = require('express'),
        router      = express.Router(),
        passport    = require('passport'),
        User        = require('../models/user');

// root route - homepage
router.get('/', function(req, res){
    res.render('home');
});

//auth signup create route
router.post('/signup', function(req, res){
    const newUser = new User({username: req.body.username})
    // admin logic
    if(req.body.password === process.env.ADMIN_CODE){
        User.register(newUser, req.body.password, function(err, user){
            if (err) {
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                passport.authenticate('local')(req, res, function(){
                    req.flash('success', 'Welcome to OART ' + user.username + '!');
                    res.redirect('/artworks');
                });
            }
        });
    } else {
        req.flash('error', 'Only Admin is allowed');
        res.redirect('back');
    }  
});

// auth login create route
router.post('/login', passport.authenticate('local', {
    successRedirect: 'back',
    failureRedirect: 'back'
}), function(req, res){});

// auth logout route
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'Thanks for your time, see you later!');
    res.redirect('/artworks');
});

// page not found handler (ensure it's the last route!)
router.get('*', function(req, res){
    res.send('Sorry, the page you are requesting for could not be found.');
});

module.exports = router;