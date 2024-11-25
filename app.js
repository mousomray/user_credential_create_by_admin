const express = require('express'); // Import For Express
const dotenv = require('dotenv'); // For .env file 
const cors = require('cors'); // For to run different server when I run use React with node 
const connectDB = require('./app/config/db.js'); // Connect Database

// For to Handle cookie and flash message 
const session = require('express-session'); // Import session 
const cookieParser = require('cookie-parser'); // Import cookie 
const flash = require('connect-flash'); // Import flash 

dotenv.config(); // .env with config
const app = express();
connectDB()

/**setup cookie and session for to use flash */
app.use(cookieParser());
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'myprojectwebskitters',
    resave: false,
    saveUninitialized: false
}))
app.use(flash()); // Use Flash

//globaly variable set for operation (like sucess , error) message
app.use((req, res, next) => {
    res.locals.sucess = req.flash('sucess'),
        res.locals.err = req.flash('err')
    next()
})

// For to View ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json()); // use Express
app.use(express.urlencoded({ extended: true })); // For to add data in form
app.use((cors())); // Use Cors  

// Make uploads and public file static
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));

// Home page (Mother Routing)
const homerouter = require('./app/router/uirouter/homerouter');
app.use('/', homerouter);

// Admin Auth Router
const adminauthrouter = require('./app/router/authrouter/authrouter');
app.use('/admin', adminauthrouter);

// Admin UI Auth Router
const adminuiauthrouter = require('./app/router/uiauthrouter/uiauthrouter');
app.use('/', adminuiauthrouter);

// User UI Auth Router
const useruirouter = require('./app/router/uirouter/userrouter');
app.use('/', useruirouter);

const port = 3004
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});