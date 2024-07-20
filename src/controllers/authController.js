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
            // Dang ky thanh cong --> luu userINFO (device, IP address, location) vao database
            let device = await Device.findOne({ where: { device: deviceId } });
            if (!device) {
                // Nếu chưa tồn tại, thêm thiết bị mới
                device = await Device.create({ device: deviceId });
            }

            const userDevice = await UserDevice.create({
                userID: user.id,
                deviceID: device.id
            });

            let ip = await IPAddress.findOne({ where: {ipAddress: ipAddress }})
            if (!ip){
                ip = await IPAddress.create({ipAddress: ipAddress});
            }

            const userIPAdress = await UserIPAddress.create({
                userID: user.id,
                ipAddressID: ip.id
            })

            const location = await Location.create({
                lat: latitude,
                long: longitude
            });

            const userLocation = await UserLocation.create({
                userID: user.id,
                locationID: location.id
            });

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
        const { email, password, deviceId, ipAddress, latitude, longitude } = req.body;
        // const ipAddress = req.ip;

        // console.log("latitude: ", latitude);
        // console.log("longitude: ", longitude);
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

        let device = await Device.findOne({ where: { device: deviceId } });
        let ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });

        let deviceExists = true;
        let ipExists = true;
        let locationExists = true;

        if (config.conditions.device) {
            // // Lay danh sach thiet bi cua User da duoc xac thuc (luu o DB)
            // const userDevices = await UserDevice.findAll({where: {userID: user.id}});
            // console.log("User id: ", user.id);
            // const deviceIds = userDevices.map(ud => ud.deviceID);
            // console.log("deviceIds: ", deviceIds);

            // // Kiem tra thiet bi moi co nam trong danh sach khong
            // const device = await Device.findOne({ where: { device: deviceId } });
            // console.log("device: ", device);
            // deviceExists = device && deviceIds.includes(device.id);

            deviceExists = await UserDevice.findOne({ where : { userID: user.id, deviceID: device.id } });
            console.log("Device exists: ", deviceExists);
        }

        if (config.conditions.ipAddress) {
            // Kiem tra dia chi IP cua user
            // const userIps = await UserIPAddress.findAll({ where: { userID: user.id } });
            // const ipIds = userIps.map(ui => ui.ipAddressID);

            // const ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });
            // ipExists = ip && ipIds.includes(ip.id);


            ipExists = await UserIPAddress.findOne({ where : { userID: user.id, ipAddressID: ip.id } });
            console.log("IP exists: ", ipExists);
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
            console.log("Location exists: ", locationExists);
        }


        if (!deviceExists || !ipExists || !locationExists) {
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
