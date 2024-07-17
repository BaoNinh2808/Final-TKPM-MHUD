const moment = require('moment');

exports.login = (req, res) => {
    res.render('login', { layout: false });
};

exports.register = (req, res) => {
    res.render('register', { layout: false });
};

exports.handleLogin = (req, res) => {
    // console.log("HELLO");

    const { email, password } = req.body;

    // console.log(req.body);

    const user = { email: 'test@gmail.com', password: 'testpass', role: 'user' }; // example user

    // console.log(username);
    // console.log(password);

    if (email === user.email && password === user.password) {
        // req.session.user = user;
        if (isNewDevice(req) || isAdmin(user) || isSuspiciousLocation(req) || isHighRiskTime(new Date())) {
            return res.redirect('/verify');
        }
        return res.redirect('/home');
    } else {
        console.log("Authentication failed");
        return res.redirect('/login');
    }
};


// Utility functions for adaptive authentication
function isNewDevice(req) {
    return false;
}

function isAdmin(user) {
    return user.role === 'admin';
}

function isSuspiciousLocation(req) {
    return false;
}

function isHighRiskTime(time) {
    // const hours = time.getHours();
    // return hours < 6 || hours > 22;
    return false;
}
