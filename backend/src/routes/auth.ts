import express from 'express';
import { register, login, getMe , getUsers} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/users', authenticate, getUsers);

export default router;

