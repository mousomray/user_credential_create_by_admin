const UserModel = require('../../model/user') // Our user Model
const { comparePassword } = require('../../middleware/auth') // Came from middleware folder
const jwt = require('jsonwebtoken'); // For to add token in header
const bcrypt = require('bcryptjs'); // For hashing password

class authcontroller {

    // Handle Register
    async register(req, res) {
        try {
            // Find email from database 
            const existingUser = await UserModel.findOne({ email: req.body.email });
            // Same email not accpected
            if (existingUser) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["User already exists with this email"]
                });
            }
            // Password Validation
            if (!req.body.password) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password is required"]
                });
            }
            if (req.body.password.length < 8) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Password should be at least 8 characters long"]
                });
            }
            // Image Path Validation
            if (!req.file) {
                return res.status(400).json({
                    message: "Validation error",
                    errors: ["Profile image is required"]
                });
            }
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const user = new UserModel({
                ...req.body, password: hashedPassword, image: req.file.path
            });
            const savedUser = await user.save();
            res.status(201).json({
                message: "Registration successfully",
                user: savedUser
            })
        } catch (error) {
            const statusCode = error.name === 'ValidationError' ? 400 : 500;
            const message = error.name === 'ValidationError'
                ? { message: "Validation error", errors: Object.values(error.errors).map(err => err.message) }
                : { message: "An unexpected error occurred" }; // Other Field validation
            console.error(error);
            res.status(statusCode).json(message);
        }
    }

    // Handle Login
    async login(req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.status(400).json({
                    message: "All fields are required"
                })
            }
            const user = await UserModel.findOne({ email })
            if (!user) {
                return res.status(400).json({
                    message: "User not found"
                })
            }
            // Check if the user is an admin
            if (user.role !== 'admin') {
                return res.status(400).json({
                    message: "Admin pannel only can access by admin"
                })
            }
            const isMatch = comparePassword(password, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: "Invalid credentials"
                })
            }
            const token = jwt.sign({
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                image: user.image,
                role: user.role
            }, process.env.API_KEY,
                { expiresIn: "1d" })
            res.status(200).json({
                message: "User login successfully",
                data: {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    image: user.image,
                    role: user.role
                },
                token: token
            })
        } catch (error) {
            console.log(error);
        }
    }
}
module.exports = new authcontroller()











