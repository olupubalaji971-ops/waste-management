const express = require('express');
const router = express.Router();
const {
  register,
  login,
  hospitalLogin,
  driverRegister,
  driverLogin,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/hospital/login', hospitalLogin);
router.post('/driver/register', driverRegister);
router.post('/driver/login', driverLogin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
