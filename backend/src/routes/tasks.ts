import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getTaskById } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, createTask);
router.put('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;

