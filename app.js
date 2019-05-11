/* Importing all required packages 
   for the app. You can just copy paste them
*/

const express = require('express');
const bodyParser = require('body-parser');
const exphb = require('express-handlebars');
const method = require('method-override');
const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config();

const client = redis.createClient(6379, 'localhost');

client.on('connect', function() {
    console.log("Connected to Redis");
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', exphb({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(method('_method'));

app.get('/', function(req, res) {
    res.render('search');
});

app.get('/movie/add', function(req, res) {
    res.render('addmovie');
});

app.post('/movie/add', function(req, res) {
    let id = req.body.id;
    let movieName = req.body.movieName;
    let director = req.body.director;
    let yearOfRelease = req.body.yearOfRelease;
    let imdbLink = req.body.imdbLink;
    let myRating = req.body.myRating;

    client.hmset(id, [
        'movieName', movieName,
        'director', director,
        'yearOfRelease', yearOfRelease,
        'imdbLink', imdbLink,
        'myRating', myRating
    ], function(err, obj) {
        if(err) {
            console.log(err);
        } else {
            console.log(obj);
            res.redirect('/');
        }
    });

});

app.post('/movie/search', function(req, res) {
    let id = req.body.id;
    client.hgetall(id, function(err, obj) {
        if(!obj) {
            res.render('search', {
                error: 'Movie does not exist'
            });
        } else {
            obj.id = id;
            res.render('details', {
                movie: obj
            });
        }
    })
});

app.delete('/movie/delete/:id', function(req, res) {
    console.log(req.params.id);
    client.del(req.params.id);
    res.redirect('/');
});

app.listen(process.env.PORT, () => {
    console.log("Server Started at port: " +process.env.PORT);
});