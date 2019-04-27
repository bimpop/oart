// require necessary modules
var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    mongoose        = require('mongoose');

// connect to database
mongoose.connect('mongodb://localhost/oart', {useNewUrlParser: true});

// set to use native findOneAndUpdate() rather than deprecated findAndModify()
mongoose.set('useFindAndModify', false);

// other modules setups
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

// artwork schema
var artworkSchema = new mongoose.Schema({
    title: String,
    image: String,
    desc: String
});
// artwork model from schema
var Artwork = mongoose.model('Artwork', artworkSchema);

// ROUTES
// homepage
app.get('/', function(req, res){
    res.render('home');
});

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
    Artwork.findById(req.params.id, function(err, foundArtwork){
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

// page not found handler (ensure it's the last route!)
app.get('*', function(req, res){
    res.send('Sorry, the page you are requesting for could not be found.');
});

// server listener
app.listen(8080 || process.env.PORT, process.env.IP, function(){
    console.log('Serving o-art...');
});