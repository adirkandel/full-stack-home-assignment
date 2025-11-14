import express from 'express';
import { createComment, getComments, deleteComment } from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getComments);
router.post('/', authenticate, createComment);
router.delete('/:id', authenticate, deleteComment);

export default router;

