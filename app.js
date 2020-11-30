const express = require('express');
const mongoose = require('mongoose');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// Connect to the database
mongoose.connect('mongodb://localhost:27017/recipeDB', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
    if (err) {
        console.log('Error Occured'.red.bold);
    } else {
        console.log('Server connected to mongoDB'.cyan.bold);
    }
});
// routes
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', (req, res) => res.render('smoothies'));
app.use(authRoutes);

// PORT
app.listen(4040, () => {
    console.log('Listening on PORT 4040'.yellow.bold);
})