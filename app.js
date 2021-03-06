const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv').config();
const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = `mongodb+srv://Auth:bharath02@cluster0.vl7kg.mongodb.net/AuthDB?retryWrites=true&w=majority`;
const db = 'mongodb+srv://Auth:bharath02@cluster0.vl7kg.mongodb.net/<dbname>?retryWrites=true&w=majority';
const d = 'mongodb://localhost:27017/recipeDB';
mongoose.connect(d, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
    if (err) {
        console.log('Error Occured while connecting to database');
    } else {
        console.log('Server connected to mongoDB');
    }
})

// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);

const port = process.env.PORT || 5050;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})