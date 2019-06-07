// require dotenv at the top
require('dotenv').config();

// require necessary modules
var express               = require('express'),
    app                     = express(),
    bodyParser              = require('body-parser'),
    methodOverride          = require('method-override'),
    mongoose                = require('mongoose'),
    expressSession          = require('express-session'),
    MongoStore              = require('connect-mongo')(expressSession),
    flash                   = require('connect-flash'),
    User                    = require('./models/user'),
    passport                = require('passport'),
    cookieParser            = require('cookie-parser'),
    LocalStrategy           = require('passport-local');

// import middlewares
var middleware = require('./middleware');

// import routes
var   artworkRoutes   = require('./routes/artworks'),
        commentRoutes   = require('./routes/comments'),
        contactRoutes   = require('./routes/contacts'),
        indexRoutes     = require('./routes/index');

// set to use native findOneAndUpdate() rather than deprecated findAndModify()
mongoose.set('useFindAndModify', false);

// connect to database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true}, function(err){
    if(err){
        console.log('My [Mongoose.connect()] err' + err);
        req.flash('error', 'Database Connection Error');
    }
});

// other modules setups
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(expressSession({
    cookie: {
        maxAge: 1000 * 60 * 60 * 2 //in milliseconds
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
/*
    *connect.session() MemoryStore is not
    designed for a production environment, as it will leak
    memory, and will not scale past a single process
*/
app.use(cookieParser(process.env.EXPRESS_SESSION_SECRET));
app.use(flash());
//require moment
app.locals.moment = require('moment');

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
app.use('/artworks',commentRoutes);
app.use('/contacts', contactRoutes);
app.use(indexRoutes);

// server listener
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Serving o-art...');
});