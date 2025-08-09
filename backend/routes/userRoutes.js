const express = require('express');
const router = express.Router();
const { registerUser, loginUser, editProfile, deleteAccount, getAllUsers, getProfile } = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', verifyToken, editProfile);
router.delete('/account', verifyToken, deleteAccount);
router.get('/users', getAllUsers); // Removed verifyToken
router.get('/profile', verifyToken, getProfile);

module.exports = router;