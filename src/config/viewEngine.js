const path = require('path');
const moment = require('moment');
const expressHbs = require('express-handlebars');

module.exports = function(app) {
    app.engine(
        'hbs',
        expressHbs.engine({
            extname: 'hbs',
            defaultLayout: 'layout',
            layoutsDir: path.join(__dirname, '../views/layouts/'),
            partialsDir: path.join(__dirname, '../views/partials/'),
            runtimeOptions: {
                allowProtoPropertiesByDefault: true,
            },
            helpers: {
                formatDate: (date) => {
                    return moment(date).format('DD/MM/YYYY');
                },
                eq: function (a, b) {
                    return a === b;
                }
            }
        })
    );
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');
};
