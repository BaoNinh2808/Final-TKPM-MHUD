const useragent = require('express-useragent');

module.exports = (req, res, next) => {
    req.useragent = useragent.parse(req.headers['user-agent']);

    // Tao mot chuoi tu userAgent va dia chi IP
    // const deviceInfo = `${req.useragent.source}-${req.ip}`;

    // req.deviceInfo = deviceInfo;

    next();
};