const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const lodash = require('lodash');
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxc6bc29d43e3d4da6a3af52250f1c156b.mailgun.org';
const mg = mailgun({ apiKey: 'd9be06f85c574400d660c6ab05300112-360a0b2c-542abf24', domain: DOMAIN });

// handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };

    // Forget password errors
    if (err.message === 'Cannot read property \'_id\' of null') {
        errors.email = 'That email is not registered';
    }

    // incorrect email
    if (err.message === 'incorrect email') {
        errors.email = 'That email is not registered';
    }

    // incorrect password
    if (err.message === 'incorrect password') {
        errors.password = 'That password is incorrect';
    }

    // duplicate email error
    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        // console.log(err);
        Object.values(err.errors).forEach(({ properties }) => {
            // console.log(val);
            // console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_TOKEN, { expiresIn: maxAge });
};

// controller actions
module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}

module.exports.forgot_get = (req, res) => {
    res.render('forgot');
}

module.exports.reset_get = (req, res) => {
    res.render('reset');
}

module.exports.signup_post = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

module.exports.login_post = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }

}

module.exports.forgot_post = async(req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        const token = createToken(user._id);

        const data = {
            from: 'noreply@hello.com',
            to: email,
            subject: 'Password Reset Link',
            html: `
                <h2>Please copy and paste the below link in the reset page</h2>
                <p>RESET String: ${token}</p>    
            `
        };

        await user.updateOne({ resetLink: token }, (err, succes) => {
            if (!err) {
                mg.messages().send(data, (error, body) => {
                    if (error) {
                        res.status(400).json({ error: error.message });
                    } else {
                        res.status(200).json({ message: 'Email has been sent to your mail' });
                    }
                })
            }
        })
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}

module.exports.reset_post = async(req, res) => {
    const { token, email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user) {
            if (token) {
                jwt.verify(token, process.env.SECRET_TOKEN, async(err, decodedData) => {
                    if (err) {
                        res.status(401).json({ error: "Incorrect token or expired token" });
                    } else {
                        try {
                            const salt = await bcrypt.genSalt();
                            const hashedPassword = await bcrypt.hash(newPassword, salt);

                            await User.findOneAndUpdate({
                                email: email
                            }, {
                                password: hashedPassword,
                                resetLink: "",
                            })
                            res.status(200).json({ message: 'Password changed successfully' });
                        } catch (error) {
                            const errors = handleErrors(error);
                            res.status(400).json({ errors });
                        }
                    }
                })
            }
        }
    } catch (error) {
        const errors = handleErrors(error);
        res.status(400).json({ errors });
    }
}