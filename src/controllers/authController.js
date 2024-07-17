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

        // console.log(req.body);

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone_number: null,
            avatar_image: null,
            role: "user",
        });

        // console.log(user);

        // res.status(201).json({ message: 'User registered successfully!', user });
        return res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);

        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({ error: 'Validation error', details: errors });
        }

        res.status(500).json({ error: error.message });
    }
};


exports.handleLogin = async (req, res) => {
    try {
        // console.log("HELLO");

        const { email, password } = req.body;

        // console.log(req.body);

        const user = await User.findOne({ where: { email } });

        if (!user){
            console.log("Authentication failed: User not found");
            // req.flash('error_message', 'Invalid email or password');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            console.log("Authentication failed: Incorrect password");
            // req.flash('error_message', 'Invalid email or password');
            return res.redirect('/login');
        }

        // console.log(username);
        // console.log(password);

        if (isNewDevice(req) || isAdmin(user) || isSuspiciousLocation(req) || isHighRiskTime(new Date())) {
            return res.redirect('/verify');
        }
        return res.redirect('/home'); 
    } catch (error) {
        console.error('Error during authentication', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
