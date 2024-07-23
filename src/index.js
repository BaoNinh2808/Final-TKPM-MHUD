const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const moment = require('moment');
const cookieParser = require('cookie-parser');
const useragent = require('./middleware/deviceMiddleware');
const getPublicIPRoute = require('./routes/getIpAPI');
const startCronJobs = require('./utils/cron');
const app = express();
const port = process.env.port || 3000;
const path = require('path');

const { sequelize } = require('./models');

app.use(cookieParser());
app.use(morgan('combined'));
const expressHbs = require('express-handlebars');

// // Middleware for handling sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static(path.join(path.dirname(__dirname), '/public')));


// console.log("dir", path.join(path.dirname(__dirname), '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(useragent); // su dung deviceMiddleware

app.use('/get-public-ip', getPublicIPRoute);


//import routes
app.use('/', require('./routes/authRoutes'));

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
                // Helper 'block'
                block: function (name, options) {
                    if (!this._blocks) this._blocks = {};
                    this._blocks[name] = options.fn(this);
                    return null;
                },
                // Helper 'content'
                content: function (name) {
                    return (this._blocks && this._blocks[name]) ? this._blocks[name] : null;
                },
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY');
                },
                eq: function (a, b) {
                    return a === b;
                },
                formatBytes: (bytes) => {
                    return formatBytes(bytes);
                },
                mimeIcon: function (mimeType) {
                    const icons = {
                        'image/png': 'bi bi-file-earmark-image',
                        'image/jpeg': 'bi bi-file-earmark-image',
                        'image/gif': 'bi bi-file-earmark-image',
                        'image/bmp': 'bi bi-file-earmark-image',
                        'image/svg+xml': 'bi bi-file-earmark-image',
                        'image/vnd.microsoft.icon': 'bi bi-file-earmark-image',
                        'text/html': 'bi bi-file-earmark-code',
                        'text/css': 'bi bi-file-earmark-code',
                        'application/javascript': 'bi bi-file-earmark-code',
                        'application/json': 'bi bi-file-earmark-code',
                        'application/xml': 'bi bi-file-earmark-code',
                        'text/plain': 'bi bi-file-earmark-text',
                        'text/csv': 'bi bi-file-earmark-text',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'bi bi-file-earmark-word',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'bi bi-file-earmark-excel',
                        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'bi bi-file-earmark-powerpoint',
                        'application/pdf': 'bi bi-file-earmark-pdf',
                        'application/rtf': 'bi bi-file-earmark-text',
                        'application/vnd.oasis.opendocument.text': 'bi bi-file-earmark-text',
                        'application/vnd.oasis.opendocument.spreadsheet': 'bi bi-file-earmark-excel',
                        'application/vnd.oasis.opendocument.presentation': 'bi bi-file-earmark-powerpoint',
                        'application/zip': 'bi bi-file-earmark-zip',
                        'application/vnd.rar': 'bi bi-file-earmark-zip',
                        'application/x-7z-compressed': 'bi bi-file-earmark-zip',
                        'audio/mpeg': 'bi bi-file-earmark-music',
                        'audio/wav': 'bi bi-file-earmark-music',
                        'audio/ogg': 'bi bi-file-earmark-music',
                        'video/mp4': 'bi bi-file-earmark-video',
                        'video/x-msvideo': 'bi bi-file-earmark-video',
                        'video/quicktime': 'bi bi-file-earmark-video',
                        'video/x-ms-wmv': 'bi bi-file-earmark-video',
                        'video/mpeg': 'bi bi-file-earmark-video'
                    };

                    return icons[mimeType] || 'bi bi-file-earmark';
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

app.get('/otp', (req, res) => {
    res.render('OTP',{layout: false});
});


// console.log(__dirname);
app.use('/home', require('./routes/homeRoutes'));

app.use('/public',  require('./routes/publicRoutes'));

app.use('/upload', require('./routes/uploadRoutes'));

app.use('/requestFile', require('./routes/requestFileRoutes'));
//404 page
app.use((req, res, next) =>{
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

// cron jobs
startCronJobs();


// Start the server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
