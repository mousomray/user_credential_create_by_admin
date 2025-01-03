const UserModel = require('../../model/user') // Our user Model
const transporter = require('../../config/emailtransporter')
const { comparePassword } = require('../../middleware/auth');
const bcrypt = require('bcryptjs'); // For hashing password
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

class usercontroller {

    // Add user form
    async adduserGet(req, res) {
        res.render('userview/adduser', { user: req.user });
    }


    // Add user post data 
    async adduserPost(req, res) {
        try {
            const { first_name, last_name, email, role } = req.body;
            if (!first_name || !last_name || !email || !role || !req.file) {
                req.flash('err', 'All fields are required');
                return res.redirect('/adduser');
            }
            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                req.flash('err', 'User already exist with this email');
                return res.redirect('/adduser');
            }

            // Generate a random password and hashing 
            const generatedPassword = crypto.randomBytes(4).toString('hex');
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(generatedPassword, salt);

            // Save user to database
            const newUser = new UserModel({
                ...req.body,
                password: hashedPassword,
                image: req.file.path
            });

            await newUser.save();

            const mailbody = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Your Account Credentials',
                html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                            <h2 style="text-align: center; color: #4CAF50;">Welcome to Our Platform!</h2>
                            <p>Dear <strong>${first_name}</strong>,</p>
                            <p>Your account has been successfully created. Below are your credentials:</p>
                            <table style="width: 100%; margin: 10px 0; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Email:</td>
                                    <td style="padding: 10px;">${email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Password:</td>
                                    <td style="padding: 10px;">${generatedPassword}</td>
                                </tr>
                            </table>
                            <p style="color: #555;">To log in and access your dashboard, click the button below:</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="http://localhost:3004/${role.toLowerCase()}/login" 
                                   style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">
                                   Login to Your Account
                                </a>
                            </div>
                            <p style="color: #888; font-size: 12px;">For security reasons, please update your password after logging in.</p>
                            <p>Best regards,<br>Admin Team</p>
                        </div>
                    `
            };


            await transporter.sendMail(mailbody);

            req.flash('sucess', 'User register successfully credential sent user email');
            return res.redirect('/adduser');
        } catch (error) {
            console.error(error);
            req.flash('err', 'Internal server error');
            return res.redirect('/adduser');
        }
    }

    // Show login user form
    async loginGet(req, res) {
        const role = req.params.role;
        return res.render('userview/userlogin', { user: req.user, role });
    }


    // Post login data 
    async loginPost(req, res) {
        try {
            const { email, password } = req.body;
            const role = req.params.role; // Dynamically get role from route
            if (!email || !password) {
                return res.status(400).send('All fields are required');
            }

            // Find user by email
            const user = await UserModel.findOne({ email });
            if (!user) {
                req.flash('err', 'User not found');
                return res.redirect(`/${role}/login`);
            }

            // Ensure only users of the specific role can log in
            if (user.role.toLowerCase() !== role.toLowerCase()) {
                req.flash('err', 'Invalid role for this route.');
                return res.redirect(`/${role}/login`);
            }

            // Verify password
            const isMatch = comparePassword(password, user.password);
            if (!isMatch) {
                req.flash('err', 'Invalid credentials');
                return res.redirect(`/${role}/login`);
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                },
                process.env.API_KEY,
                { expiresIn: '1d' }
            );

            // Save token in cookie
            if (token) {
                res.cookie('user_auth', token);
                req.flash('success', 'Login successfully');
                return res.redirect(`/${role}/dashboard`); // Redirect to role-specific dashboard
            } else {
                req.flash('err', 'Something went wrong');
                return res.redirect(`/${role}/login`);
            }
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).send('An unexpected error occurred');
        }
    }

    // User dashboard
    async dashboardpage(req, res) {
        try {
            const role = req.params.role;
            return res.render('userview/dashboard', { user: req.user, role });
        } catch (error) {
            res.status(500).send("Server error");
        }
    };

    // Show update password form
    async updatepasswordGet(req, res) {
        const role = req.params.role; // Dynamically get role from route
        return res.render('userview/userupdatepassword', { user: req.user, role });
    }

    // Update Password post 
    async updatepasswordPost(req, res) {
        try {
            const userId = req.user._id; // Get user ID from token
            const role = req.params.role; // Dynamically get role from route
            const { newPassword, confirmPassword } = req.body;
            if (!newPassword || !confirmPassword) {
                req.flash('err', "All fields are required")
                return res.redirect(`/${role}/updatepassword`)
            }
            if (newPassword.length < 8) {
                req.flash('err', "Password should be atleast 8 characters long")
                return res.redirect(`/${role}/updatepassword`)
            }
            if (newPassword !== confirmPassword) {
                req.flash('err', "Password don't match")
                return res.redirect(`/${role}/updatepassword`)
            }
            const user = await UserModel.findById(userId);
            if (!user) {
                req.flash('err', "User not found")
                return res.redirect(`/${role}/updatepassword`)
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
            await user.save();
            req.flash('sucess', 'Password update successfully')
            return res.redirect(`/${role}/dashboard`);
        } catch (error) {
            req.flash('err', "Error updating password")
            return res.redirect(`/${role}/updatepassword`)
        }
    }


    // Handle Logout
    async logout(req, res) {
        const role = req.params.role; // Dynamically get role from route
        console.log("My role...",role)
        res.clearCookie('user_auth');
        req.flash('sucess', 'Logout Successfully')
        return res.redirect(`/${role}/login`);
    }

}

module.exports = new usercontroller(); 