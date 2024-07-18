const bcrypt = require('bcrypt');
const { User, Device, UserDevice, IPAddress, UserIPAddress } = require('../models');

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

        // Kiem tra user
        const user = await User.findOne({ where: { email } });

        // Lay danh sach thiet bi cua User da duoc xac thuc (luu o DB)
        const userDevices = await UserDevice.findAll({where: {userID: user.id}});
        const deviceIds = userDevices.map(ud => ud.deviceID);

        // // Kiem tra thiet bi moi co nam trong danh sach khong
        const device = await Device.findOne({where: { device: deviceId}});
        const deviceExists = device && deviceIds.includes(device.id);

        console.log(deviceExists);

        // // Kiem tra dia chi IP cua user
        const userIps = await UserIPAddress.findAll({ where: { userID: user.id } });
        const ipIds = userIps.map(ui => ui.ipAddressID);

        const ip = await IPAddress.findOne({ where: { ipAddress: ipAddress } });
        const ipExists = ip && ipIds.includes(ip.id);

        console.log(ipExists);


        // console.log(user);
        if (!user) {
            // update lại client side nếu user không tồn tại
            return res.redirect('/login');
        }

        const match = await bcrypt.compare(password, user.password);

        // kiem tra email && password
        if (match) {
            // kiem tra deviceInfo && IPAddress
            if (!deviceExists || !ipExists){
                // Neu thiet bi va dia chi ip moi thi chuyen den trang xac thuc
                return res.redirect('/verify');
            }
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

