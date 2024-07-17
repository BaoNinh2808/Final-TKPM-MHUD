const express = require('express');
const session = require('express-session');
const morgan = require('morgan');

const app = express();
const port = process.env.port || 3000;
const path = require('path');

app.use(morgan('combined'));

// // Middleware for handling sessions
// app.use(session({
//     secret: 'your_secret_key',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false }
// }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine
require('./config/viewEngine')(app);

// Routes
app.use(require('./routes'));

// 404 page
app.use((req, res, next) => {
    res.status(404).send('File not found!');
});

// 500 error
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send('Internal Server Error!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
