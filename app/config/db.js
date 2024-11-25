const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL) // Present in .env file
        console.log('MongoDB connected')
    } catch (error) {
        console.log('mongodb error', error)

    }

}
module.exports = connectDB;