const UserModel = require('../../model/user');
const { comparePassword } = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class uiauthcontroller {

    // Show registration form
    async registerGet(req, res) {
        return res.render('authview/register', { user: req.user });
    }

    // For Register
    async registerPost(req, res) {
        try {
            const { first_name, last_name, email, password } = req.body;
            if (!first_name || !last_name || !email || !password || !req.file) {
                req.flash('err', 'All fields are required');
                return res.redirect('/admin/registration');
            }
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                req.flash('err', 'User already exist with this email');
                return res.redirect('/admin/registration');
            }
            if (password.length < 8) {
                req.flash('err', 'Password should be atleast 8 characters');
                return res.redirect('/admin/registration');
            }
            // Hash password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const user = new UserModel({
                ...req.body, password: hashedPassword, image: req.file.path
            });
            // Save user to database
            await user.save();
            req.flash('sucess', 'Registration successfully')
            return res.redirect('/admin/signin');
        } catch (error) {
            req.flash('err', 'Error during Registration');
            return res.redirect('/admin/registration');
        }
    }

    // Show login form
    async loginGet(req, res) {
        return res.render('authview/login', { user: req.user });
    }

    // For Login post
    async loginPost(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                req.flash('err', 'All fields are required');
                return res.redirect('/admin/signin');
            }
            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('err', 'User Not Found');
                return res.redirect('/admin/signin');
            }
            // Check if the user is an admin
            if (user.role !== 'projectmanager') {
                req.flash('err', 'Admin pannel only can access by projectmanager');
                return res.redirect('/admin/signin');
            }
            const isMatch = comparePassword(password, user.password);
            if (!isMatch) {
                req.flash('err', 'Invalid Credential');
                return res.redirect('/admin/signin');
            }
            // Generate a JWT token
            const token = jwt.sign({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                image: user.image,
                role: user.role
            }, process.env.API_KEY, { expiresIn: "1d" });

            // Handling token in cookie
            if (token) {
                res.cookie('admin_auth', token);
                req.flash('sucess', 'Login Successfully')
                return res.redirect('/');
            } else {
                req.flash('err', 'Something went wrong')
                return res.redirect('/admin/signin');
            }
        } catch (error) {
            req.flash('err', 'Error doing login')
            return res.redirect('/admin/signin');
        }
    }

    // Handle Logout
    async logout(req, res) {
        res.clearCookie('admin_auth');
        req.flash('sucess', 'Logout Successfully')
        return res.redirect('/admin/signin');
    }
}

module.exports = new uiauthcontroller();









