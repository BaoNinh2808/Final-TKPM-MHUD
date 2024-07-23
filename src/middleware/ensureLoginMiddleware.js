const jwt = require('jsonwebtoken');

const ensureLoginMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (req.cookies.isLogged) {
        jwt.verify(token, process.env.JWT_KEY, (err, user) => {
            if (err) {
                res.clearCookie('isLogged', { path: '/' });
                return res.redirect('/login');
            }
            req.user = user;
            return next();
        });
    }
    else {
        return res.redirect('/login');
    }
}

module.exports = ensureLoginMiddleware;