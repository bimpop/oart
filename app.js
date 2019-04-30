// require dotenv at the top
require('dotenv').config();

// require necessary modules
const express                 = require('express'),
    app                     = express(),
    bodyParser              = require('body-parser'),
    methodOverride          = require('method-override'),
    mongoose                = require('mongoose'),
    expressSession          = require('express-session'),
    User                    = require('./models/user'),
    Artwork                 = require('./models/artwork'),
    Comment                 = require('./models/comment'),
    passport                = require('passport'),
    LocalStrategy           = require('passport-local'),
    passportLocalMongoose   = require('passport-local-mongoose');

// connect to database
mongoose.connect('mongodb://localhost/oart', {useNewUrlParser: true});

// set to use native findOneAndUpdate() rather than deprecated findAndModify()
mongoose.set('useFindAndModify', false);

// other modules setups
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(expressSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==================
// ROUTES
// ==================

// homepage
app.get('/', function(req, res){
    res.render('home');
});

// ARTWORKS ROUTES

// artworks index route
app.get('/artworks', function(req, res){
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
app.get('/artworks/new', function(req, res) {
    res.render('artworks/new');
});

// artworks create route
app.post('/artworks', function(req, res){
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
app.get('/artworks/:id', function(req, res){
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
app.get('/artworks/:id/edit', function(req, res){
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
app.put('/artworks/:id', function(req, res){
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
app.delete('/artworks/:id', function(req, res){
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

// COMMENTS ROUTE

// comments new route
app.get('/artworks/:id/comments/new', function(req, res){
    // find artwork first
    Artwork.findById(req.params.id, function(err, artwork){
        if (err) {
            console.log(err);
            res.redirect('/artworks');
        } else {
            // render add new comment form
            res.render('comments/new', {artwork: artwork});
        }
    });
});

//comments create route
app.post('/artworks/:id/comments', function(req, res){
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
app.get('/artworks/:id/comments/:comment_id/edit', function(req, res){
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
app.put('/artworks/:id/comments/:comment_id', function(req, res){
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
app.delete('/artworks/:id/comments/:comment_id', function(req, res){
    // find and delete the comment
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err) {
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/artworks/' + req.params.id);
        }
    });
});

// AUTH ROUTES

// auth signup new route
app.get('/signup', function(req, res){
    res.render('signup');
});

//auth signup create route
app.post('/signup', function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.render('signup');
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/artworks');
            });
        }
    });
});

// auth login new route
app.get('/login', function(req, res){
    res.render('login');
});

// auth login create route
app.post('/login', passport.authenticate('local', {
    successRedirect: '/artworks',
    failureRedirect: '/login'
}), function(req, res){
    
});

// page not found handler (ensure it's the last route!)
app.get('*', function(req, res){
    res.send('Sorry, the page you are requesting for could not be found.');
});

// server listener
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Serving o-art...');
});