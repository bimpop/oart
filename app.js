// require dotenv at the top
require('dotenv').config();

// require necessary modules
const express               = require('express'),
    app                     = express(),
    bodyParser              = require('body-parser'),
    methodOverride          = require('method-override'),
    mongoose                = require('mongoose'),
    expressSession          = require('express-session'),
    flash                   = require('connect-flash'),
    User                    = require('./models/user'),
    passport                = require('passport'),
    LocalStrategy           = require('passport-local');

// import middlewares
const middleware = require('./middleware');

// import routes
const   artworkRoutes   = require('./routes/artworks'),
        commentRoutes   = require('./routes/comments'),
        indexRoutes     = require('./routes/index');

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
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// apply middleware
app.use(middleware.currentUser);

// routes setup
// can't include route-link pre-appends for routes (commentRoutes in this case) with req.params
// haven't figured out how to reference the req.params in the route file
app.use('/artworks', artworkRoutes);
app.use(commentRoutes);
app.use(indexRoutes);

// server listener
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Serving o-art...');
});