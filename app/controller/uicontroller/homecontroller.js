class homecontroller {
    async home(req, res) {
        res.render('homeview/home', { user: req.user });
    }
}

module.exports = new homecontroller(); 