exports.home = (req, res) => {
    // if (!req.session.user) {
    //     return res.redirect('/login');
    // }

    // const user = req.session.user;
    // const currentTime = new Date();

    // if (isNewDevice(req) || isAdmin(user) || isSuspiciousLocation(req) || isHighRiskTime(currentTime)) {
    //     return res.redirect('/verify');
    // } else {
    //     res.sendFile(__dirname + '/views/layouts/layout.html');
    // }

    // res.send('Welcome to the home page!');
    res.render('home', {layout: false});
};

exports.verify = (req, res) => {
    res.send('Verification step required.');
};
