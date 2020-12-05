const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);
router.get('/forgot', authController.forgot_get);
router.post('/forgot', authController.forgot_post);
router.get('/reset', authController.reset_get);
router.post('/reset', authController.reset_post);
module.exports = router;