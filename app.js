const express = require("express");
require("dotenv").config();
const expressLayout = require("express-ejs-layouts");
const main = require('./server/routes/main');
const connectDB = require('./server/config/db')

const app = express();
const PORT = 3000 || process.env.PORT;

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


//template engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs')


app.use('/', main);

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT} `)
})