const express = require("express");
require("dotenv").config();
const expressLayout = require("express-ejs-layouts");
const metthodOverride = require("method-override");
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const main = require('./server/routes/main');
const admin = require('./server/routes/admin');
const connectDB = require('./server/config/db');
const session = require("express-session");
const { isActiveRoute } = require('./server/helpers/routeHelpers');

const app = express();
const PORT = 3000 || process.env.PORT;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(metthodOverride('_method'));


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL
    })
}))

app.use(express.static('public'));


//template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs')

app.locals.isActiveRoute = isActiveRoute;
app.use((req, res, next) => {
    res.locals.currentRoute = req.path;
    next();
});


app.use('/', main);
app.use('/', admin);

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT} `)
})