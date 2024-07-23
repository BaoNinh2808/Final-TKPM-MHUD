const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { User, Device, UserDevice, IPAddress, UserIPAddress, Location, UserLocation, Verification } = require('../models');
const { where } = require('sequelize');

// Doc file config authentication
const configPath = path.resolve(__dirname, '../config/configAuthentication.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

exports.login = (req, res) => {
    res.render('login', { layout: false });
};

exports.register = (req, res) => {
    res.render('register', { layout: false });
};

exports.handleRegister = async (req, res) => {
    try {
        const { name, email, password, deviceId, ipAddress, latitude, longitude } = req.body;

        // console.log("hello" + latitude + "world");
        // console.log("hello" + longitude + "world");


        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(deviceId);
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
            // Dang ky thanh cong --> luu agentID cua device vao database
            let device = await Device.findOne({ where: { device: deviceId } });
            if (!device) {
                device = await Device.create({
                    device: deviceId
                });
            }
            let userDevice = await UserDevice.findOne({ where : { userID: user.id, deviceID: device.id } });
            if (!userDevice) {
                await UserDevice.create({ userID: user.id, deviceID: device.id });
            }

            let ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });
            if (!ip) {
                ip = await IPAddress.create({
                    ipAddress: ipAddress
                });
            }
            let userIP = await UserIPAddress.findOne({ where : { userID: user.id, ipAddressID: ip.id } });
            if (!userIP) {
                await UserIPAddress.create({ userID: user.id, ipAddressID: ip.id });
            }

            let location = await Location.findOne({ where: {lat: latitude, long: longitude}});
            if (!location){
                location = await Location.create({
                    lat: latitude,
                    long: longitude
                });
            }

            let userLocation = await UserLocation.findOne({ whrere: {userID: user.id, locationID: location.id}});
            if (!userLocation) {
                userLocation = await UserLocation.create({
                    userID: user.id,
                    locationID: location.id
                });
            }
            return res.status(200).json({ success: true });
        }
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
        const { email, password, deviceId, ipAddress, latitude, longitude } = req.body;

        // Kiem tra user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // return res.redirect('/login');

            return res.status(400).json({ error: 'Email or password incorrect' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            // console.log("Authentication failed");
            // return res.redirect('/login');

            return res.status(400).json({ error: 'Email or password incorrect' });
        }

        let device = await Device.findOne({ where: { device: deviceId } });
        let ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });

        if (!device) {
            device = await Device.create({ device: deviceId });
        }
        if (!ip) {
            ip = await IPAddress.create({ ipAddress: ipAddress });
        }

        let deviceExists = true;
        let ipExists = true;
        let locationExists = true;

        if (config.conditions.device) {
            deviceExists = await UserDevice.findOne({ where : { userID: user.id, deviceID: device.id } });
            // console.log("Device exists: ", deviceExists);
        }

        if (config.conditions.ipAddress) {
            ipExists = await UserIPAddress.findOne({ where : { userID: user.id, ipAddressID: ip.id } });
            // console.log("IP exists: ", ipExists);
        }


        if (config.conditions.locationRadius){
            // Kiem tra Location cua user
            const userLocations = await UserLocation.findAll({ where: { userID: user.id } });
            const locations = await Location.findAll({
                where: {
                    id: userLocations.map(ul => ul.locationID)
                }
            })

            for (const loc of locations){
                const distance = haversine(latitude, longitude, loc.lat, loc.long);
                if (distance <= config.conditions.locationRadius){ // kiem tra ban kinh 5km
                    locationExists = true;
                    break;
                }
            }
            // console.log("Location exists: ", locationExists);
        }

        // Store session info
        req.session.deviceID = device.id;
        req.session.deviceId = deviceId;
        req.session.ipAddressID = ip.id;
        req.session.user = user;

        if (!deviceExists || !ipExists || !locationExists) {
            const pin = generatePIN();
            
            // Save the PIN for verification
            await Verification.create({
                userID: user.id,
                pin,
                createdAt: new Date(),
            });

            const mailOptions = {
                from: 'F88.com - Nha cai den tu Chau Au',
                to: user.email,
                subject: 'Verification PIN',
                text: `A login attempt was made from a new device or IP address. Please verify by entering this PIN: ${pin}`
            };

            await transporter.sendMail(mailOptions);

            // Redirect to verification page
            return res.redirect('/OTP');
        }


        // If the device and IP are verified, sign JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });
        res.cookie('isLogged', true);
        res.cookie('userID', user.id);

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        // return res.redirect('/login');
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'huymasterpiece@gmail.com',
        pass: 'egsl weqx svkh ukue'
    }
});

function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.verifyPIN = async (req, res) => {
    try {
        const { pin } = req.body;
        const deviceId = req.session.deviceId;
        const deviceID = req.session.deviceID;
        const ipAddressID = req.session.ipAddressID;
        const user = req.session.user;
        const userId = user.id;
        console.log(userId);
        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in session' });
        }

        const userIdStr = userId.toString();

        const verification = await Verification.findOne({ where: { userID: userIdStr, pin } });

        if (!verification) {
            return res.status(400).json({ error: 'Invalid PIN' });
        }

        // Check if the device or IP address has been verified
        let userDevice = await UserDevice.findOne({ where : { userID: userId, deviceID: deviceID } });
        let userIP = await UserIPAddress.findOne({ where : { userID: userId, ipAddressID: ipAddressID } });

        if (!userDevice) {
            await UserDevice.create({ userID: userId, deviceID: deviceID });
        }
        if (!userIP) {
            await UserIPAddress.create({ userID: userId, ipAddressID:   ipAddressID });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
        res.cookie('token', token, { httpOnly: true });
        res.cookie('isLogged', true);
        res.cookie('userID', userId);
        // Redirect to home
        return res.redirect('/home');
    } catch (error) {
        console.error('Error verifying PIN:', error);
        return res.status(500).json({ error: 'An error occurred while verifying OTP. Please try again later.' });
    }
};


// Công thức Haversine để tính khoảng cách giữa hai điểm địa lý
function haversine(lat1, lon1, lat2, lon2) {
    const toRad = x => x * Math.PI / 180;
    const R = 6371; // Bán kính trái đất tính theo km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

exports.resendPIN = async (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID not found in session' });
        }

        const pin = generatePIN();

        // Save the PIN for verification
        await Verification.create({
            userID: userId,
            pin,
            createdAt: new Date(),
        });

        const user = await User.findByPk(userId);

        const mailOptions = {
            from: 'huymasterpiece@gmail.com',
            to: user.email,
            subject: 'Verification PIN',
            text: `A login attempt was made from a new device or IP address. Please verify by entering this PIN: ${pin}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'PIN sent successfully' });

    } catch (error) {
        console.error('Error resending PIN:', error);
        return res.status(500).json({ error: 'An error occurred while resending OTP. Please try again later.' });
    }
}

exports.logout = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('token', { path: '/' });
        res.clearCookie('isLogged', { path: '/' });
        res.redirect('/login');
    }
    catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'An error occurred while logging out. Please try again later.' });
    }
}