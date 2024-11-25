const mongoose = require('mongoose')
const Schema = mongoose.Schema


const UserSchema = new Schema({
    first_name: {
        type: String,
        required: "First name is Required",
        minlength: [3, 'First name must be at least 3 characters long']
    },
    last_name: {
        type: String,
        required: "Last name is Required",
        minlength: [3, 'Last name must be at least 3 characters long']
    },
    email: {
        type: String,
        required: "Email is Required",
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email address should follow the format: abc@gmail.com']
    },
    password: {
        type: String,
        required: "Password is Required",
        minlength: [8, 'Password must be at least 8 characters long']
    },
    image: {
        type: String,
        required: "Image is required"
    },
    role: {
        type: String,
        default: 'admin', // Set default value to 'admin'
    }
})

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;