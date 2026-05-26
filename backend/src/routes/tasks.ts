import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, getTaskById } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validateCreateTask, validateTaskListQuery, validateUpdateTask } from '../middleware/taskValidation';
import { requireJsonObjectBody } from '../middleware/validation';

const router = express.Router();

router.get('/', authenticate, validateTaskListQuery, getTasks);
router.get('/:id', authenticate, getTaskById);
router.post('/', authenticate, requireJsonObjectBody, validateCreateTask, createTask);
router.patch('/:id', authenticate, requireJsonObjectBody, validateUpdateTask, updateTask);
router.delete('/:id', authenticate, deleteTask);

export default router;
