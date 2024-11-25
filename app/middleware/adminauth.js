const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    try {
        const token = req.cookies?.admin_auth;
        if (!token) {
            req.flash('err', "You can't access that page without login")
            return res.redirect('/admin/signin'); // Redirect to login page if user is not authenticated
        }
        // Check if the token is named 'kaka_auth'
        if (!req.cookies.hasOwnProperty('admin_auth')) {
            req.flash('err', "Only admin can access admin pannel");
            return res.redirect('/admin/signin'); // Redirect if the token is not properly named
        }
        jwt.verify(token, process.env.API_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token. Please login again.' });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Error in JWT authentication middleware:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { adminAuth };