// require necessary modules
var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override');

// other module setups
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

var artworks = [
    {
        title: 'Incandescensce',
        image: '/pics/bimbo1.jpg',
        desc: 'Radiant beauty'
    },
    {
        title: 'Transluscence',
        image: '/pics/bimbo2.jpg',
        desc: 'Check me out'
    },
    {
        title: 'Infinity',
        image: '/pics/bimbo3.jpg',
        desc: 'You can\'t touch this'
    },
    {
        title: 'Exquisite',
        image: '/pics/bimbo4.jpg',
        desc: 'Prince charming'
    }
];

// ROUTES
// homepage
app.get('/', function(req, res){
    res.render('home');
});

// artworks index route
app.get('/artworks', function(req, res){
    res.render('artworks/index', {artworks: artworks});
});

// artworks new route
app.get('/artworks/new', function(req, res) {
    res.render('artworks/new');
});

// artworks create route
app.post('/artworks', function(req, res){
    var newArtwork = req.body.artwork;
    artworks.unshift(newArtwork);
    res.redirect('artworks');
});

// artworks show route
app.get('/artworks/:title', function(req, res){
    artworks.forEach(function(artwork){
        if(req.params.title == artwork.title){
            res.render('artworks/show', {artwork: artwork});
        }else {
            artwork;
        }
    });
});

// artwork edit route
app.get('/artworks/:title/edit', function(req, res){
    artworks.forEach(function(artwork){
        if(req.params.title == artwork.title){
            res.render('artworks/edit', {artwork: artwork});
        }else {
            artwork;
        }
    });
});

// artwork update route
app.put('/artworks/:title', function(req, res){
    for(let i=0; i<artworks.length; i++){
        if(req.params.title == artworks[i].title){
            artworks.splice(i, 1, req.body.artwork);
            res.redirect('/artworks/' + req.params.title);
        }else {
            i;
        }
    }
});

// artwork destroy route
app.delete('/artworks/:title', function(req, res){
    for(let i=0; i<artworks.length; i++){
        if(req.params.title == artworks[i].title){
            artworks.splice(i, 1);
            res.redirect('/artworks/');
        }else {
            i;
        }
    }
});

// page not found handler (ensure it's the last route!)
app.get('*', function(req, res){
    res.send('Sorry, the page you are requesting for could not be found.');
});

// server listener
app.listen(8080 || process.env.PORT, process.env.IP, function(){
    console.log('Serving o-art...');
});