// cofig to use express
const express = require('express');
const app = express();
const port = process.env.port || 3000;
const path = require("path");
const moment = require('moment');

// config to use handlebars
const expressHbs = require('express-handlebars');

// set static folder is public
app.use(express.static(path.dirname(__dirname) + "/public"));

console.log(path.dirname(__dirname) + "/public");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set view engine
app.engine(
    'hbs',
    expressHbs.engine(
        {
            extname: 'hbs',
            defaultLayout: "layout",
            layoutsDir: __dirname + '/views/layouts/',
            partialsDir: __dirname + '/views/partials/',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
            },
            helpers : {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY');
                },
                eq: function (a, b) {
                    return a === b;
                }
            }
        }
    )
)
app.set("views", __dirname + "/views");
app.set('view engine', 'hbs');

//create tables by code
app.get('/createTables', (req, res) => {
    const models = require('../models');
    models.sequelize.sync().then(() => {
        res.send('table created');
    });
});

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login',{layout: false});
});

app.get('/register', (req, res) => {
    res.render('register',{layout: false});
});

app.get('/otp', (req, res) => {
    res.render('OTP',{layout: false});
});


console.log(__dirname);
app.get('/home', (req, res) => {
    res.render('homepage',{layout: false});
});

app.use('/upload', require('./routes/homeRoute'));

//404 page
app.use((req, res, next) =>{
    res.status(404).send('File not found!');
})

//500 error
app.use((err, req, res, next) =>{
    console.log(err);
    res.status(500).send('Internal Server Error!');
})

//Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});