const express = require('express');
const session = require('express-session');
const morgan = require('morgan');

const app = express();
const port = process.env.port || 2000;
const path = require('path');

const { sequelize } = require('./models');

app.use(morgan('combined'));
const expressHbs = require('express-handlebars');

// // Middleware for handling sessions
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));

app.use(express.static(path.join(__dirname, '/public')));


console.log(path.join(__dirname, 'public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', require('./routes/authRoutes'));
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
    const models = require('./models');
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

console.log(__dirname);
app.get('/home', (req, res) => {
    res.render('homepage',{layout: false});
});

// 404 page
app.use((req, res, next) => {
    res.status(404).send('File not found!');
});

// 500 error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Internal Server Error!');
});

// sync data
sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
}).catch(error => {
    console.error('Error creating database & tables:', error);
});


// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
