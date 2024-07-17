const moment = require('moment');
const bcrypt = require('bcrypt');
const { User } = require('../models');


exports.login = (req, res) => {
    res.render('login', { layout: false });
};

exports.register = (req, res) => {
    res.render('register', {layout: false});
}

exports.handleRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone_number: null,
            avatar_image: null,
            role: "user",
        });

        res.status(201).json({ message: 'User registered successfully!', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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
