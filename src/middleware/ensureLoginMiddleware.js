const ensureLoginMiddleware = (req, res, next) => {
    if (req.cookies.isLogged) {
        return next(); 
    } else {
        res.redirect('/'); 
    }
}

module.exports = ensureLoginMiddleware;