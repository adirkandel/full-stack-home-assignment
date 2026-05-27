import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateLogin, validateRegister } from '../middleware/authValidation';
import { requireJsonObjectBody } from '../middleware/validation';

const router = express.Router();

router.post('/register', requireJsonObjectBody, validateRegister, register);
router.post('/login', requireJsonObjectBody, validateLogin, login);
router.get('/me', authenticate, getMe);

export default router;
