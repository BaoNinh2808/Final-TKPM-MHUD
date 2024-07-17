const bcrypt = require('bcrypt');
const { User } = require('../models');

exports.login = (req, res) => {
    res.render('login', { layout: false });
};

exports.register = (req, res) => {
    res.render('register', { layout: false });
};

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

        if (!user) {
            // update phía client - thông báo lỗi
            return res.status(400).json({ error: 'Cannot create user' });
        }
        else {
            return res.redirect('/login');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        console.log(user);
        if (!user) {
            // update lại client side nếu user không tồn tại
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // if (isNewDevice(req) || isAdmin(user) || isSuspiciousLocation(req) || isHighRiskTime(new Date())) {
            //     return res.redirect('/verify');
            // }
            return res.redirect('/home');
        } else {
            console.log("Authentication failed");
            return res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
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
    const hours = time.getHours();
    return hours < 6 || hours > 22;
}
