const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { User, Device, UserDevice, IPAddress, UserIPAddress,Verification } = require('../models');

exports.login = (req, res) => {
    res.render('login', { layout: false });
};

exports.register = (req, res) => {
    res.render('register', { layout: false });
};

exports.handleRegister = async (req, res) => {
    try {
        const { name, email, password, deviceId } = req.body;

        console.log(deviceId);

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
            // Dang ky thanh cong --> luu agentID cua device vao database
            const device = await Device.create({
                device: deviceId
            });

            const userDevice = await UserDevice.create({
                userID: user.id,
                deviceID: device.id
            });

            const ip = await IPAddress.create({
                ipAddress: req.ip,
            });

            const userIPAdress = await UserIPAddress.create({
                userID: user.id,
                ipAddressID: ip.id
            })

            return res.redirect('/login');
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
        const { email, password, deviceId } = req.body;
        const ipAddress = req.ip;

        console.log("Device ID: ", deviceId);
        // Kiem tra user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            console.log("Authentication failed");
            return res.redirect('/login');
        }

        // Lay danh sach thiet bi cua User da duoc xac thuc (luu o DB)
        const userDevices = await UserDevice.findAll({where: {userID: user.id}});
        const deviceIds = userDevices.map(ud => ud.deviceID);

        // // Kiem tra thiet bi moi co nam trong danh sach khong
        const device = await Device.findOne({ where: { device: deviceId } });
        const deviceExists = device && deviceIds.includes(device.id);

        // console.log(deviceExists);

        // // Kiem tra dia chi IP cua user
        const userIps = await UserIPAddress.findAll({ where: { userID: user.id } });
        const ipIds = userIps.map(ui => ui.ipAddressID);

        const ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });
        const ipExists = ip && ipIds.includes(ip.id);

        // console.log(ipExists);

        if (!deviceExists) {
            const pin = generatePIN();
            
            // Save the PIN for verification
            await Verification.create({
                userID: user.id,
                pin: pin
            });

            const mailOptions = {
                from: 'huymasterpiece@gmail.com',
                to: user.email,
                subject: 'Verification PIN',
                text: `A login attempt was made from a new device or IP address. Please verify by entering this PIN: ${pin}`
            };

            await transporter.sendMail(mailOptions);

            // Redirect to verification page
            // return res.redirect('/verify');
            return res.redirect('/login');
        }

        // If the device and IP are verified
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });
        
        return res.redirect('/home');
    } catch (error) {
        console.error(error);
        return res.redirect('/login');
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
        const { userId, pin } = req.body;

        const verification = await Verification.findOne({ where: { userID: userId, pin } });

        if (!verification) {
            return res.status(400).send('Invalid PIN');
        }

        // If the PIN is correct, you can proceed with the login process
        // Mark the device and IP as verified if needed
        await UserDevice.create({ userID: userId, deviceID: verification.deviceID });
        await UserIPAddress.create({ userID: userId, ipAddressID: verification.ipAddress });

        // Redirect to home
        return res.redirect('/home');
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
};
